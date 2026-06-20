"""
Rule-based recommendation engine.

Deterministic — each recommendation traces directly back to the numeric
breakdown from the risk engine.  No LLM calls, no hidden logic.

Mapping rules (evaluated in order):
  1. If fire_density_contribution is the single largest contributor AND ≥ 15:
       "Active fire detections within 50 km — prepare evacuation essentials"
       "Clear defensible space around your property immediately"

  2. If humidity_contribution is dominant AND humidity_pct < 25:
       "Critical low humidity — avoid ALL outdoor burning"
       "Increase vegetation irrigation where possible"

  3. If wind_contribution ≥ 12:
       "Elevated wind speeds — monitor fire spread direction"
       "Secure loose outdoor materials that could become projectiles"

  4. If temperature sub-score ≥ 70 (temp > 28 °C):
       "High ambient temperature — fuel moisture is critically low"

  5. Always if risk_level is "High" or "Critical":
       "Monitor local emergency alerts and evacuation orders"
       "Know your evacuation route before you need it"

  6. Always if risk_level is "Low":
       "Conditions are currently favorable — stay informed of changes"
"""

from typing import Any


def generate_recommendations(
    risk_level: str,
    breakdown: list[dict[str, Any]],
    weather: dict[str, Any],
) -> dict:
    """
    Produce a recommendation response from the risk breakdown.

    Args:
        risk_level:  "Low" | "Moderate" | "High" | "Critical"
        breakdown:   list from risk_engine.compute_risk()
        weather:     {"temperature_c", "humidity_pct", "wind_kmh"}

    Returns:
        {
            "risk_level": str,
            "primary_drivers": [str, ...],
            "recommended_actions": [str, ...],
        }
    """
    # Index breakdown by factor name for convenient access
    by_factor = {b["factor"]: b for b in breakdown}

    temp_contrib  = by_factor["Temperature"]["contribution"]
    hum_contrib   = by_factor["Humidity"]["contribution"]
    wind_contrib  = by_factor["Wind Speed"]["contribution"]
    fire_contrib  = by_factor["Fire Density"]["contribution"]

    temp_sub    = by_factor["Temperature"]["sub_score"]
    hum_pct     = weather.get("humidity_pct", 50)
    detections  = int(by_factor["Fire Density"]["value"].split()[0])

    # ── Identify primary drivers (any factor in top-2 by contribution) ──────
    contribs = [
        ("Temperature",  temp_contrib),
        ("Humidity",     hum_contrib),
        ("Wind Speed",   wind_contrib),
        ("Fire Density", fire_contrib),
    ]
    sorted_contribs = sorted(contribs, key=lambda x: x[1], reverse=True)
    top2 = [name for name, val in sorted_contribs[:2] if val >= 8]

    # Human-readable driver labels
    driver_labels = {
        "Temperature":  f"High temperature ({weather.get('temperature_c', 0):.1f}°C)",
        "Humidity":     f"Low humidity ({hum_pct:.0f}%)",
        "Wind Speed":   f"Elevated wind ({weather.get('wind_kmh', 0):.0f} km/h)",
        "Fire Density": f"{detections} active fire detection(s) within 50 km",
    }
    primary_drivers = [driver_labels[d] for d in top2]

    actions: list[str] = []

    # Base level-specific actions
    if risk_level == "Low":
        actions += [
            "No immediate wildfire threat detected.",
            "Monitor regional weather changes."
        ]
    elif risk_level == "Moderate":
        actions += [
            "Moderate wildfire threat potential.",
            "Monitor regional weather changes and local news."
        ]
    elif risk_level == "High":
        actions += [
            "Avoid outdoor burning.",
            "Review evacuation routes.",
            "Prepare emergency supplies."
        ]
    elif risk_level == "Critical":
        actions += [
            "Prepare for potential evacuation.",
            "Follow local authority guidance immediately."
        ]

    # ── Rule 1: Active fires nearby ──────────────────────────────────────────
    if fire_contrib >= 15:
        actions += [
            "Active fire detections within 50 km — prepare evacuation essentials now",
            "Clear defensible space around your property immediately",
        ]

    # ── Rule 2: Critical low humidity ────────────────────────────────────────
    if hum_pct < 25:
        actions += [
            "Critical low humidity detected — avoid all outdoor burning",
            "Increase vegetation irrigation where possible",
        ]
    elif hum_contrib >= 12 and hum_pct < 40:
        actions.append("Low humidity — avoid outdoor burning and open flames")

    # ── Rule 3: High winds ────────────────────────────────────────────────────
    if wind_contrib >= 12:
        actions += [
            "Elevated wind speeds detected — monitor fire spread direction closely",
            "Secure loose outdoor materials that could become airborne projectiles",
        ]

    # ── Rule 4: High temperature ─────────────────────────────────────────────
    if temp_sub >= 70:
        actions.append(
            f"High ambient temperature ({weather.get('temperature_c', 0):.1f}°C) — "
            "fuel moisture is critically low, ignition risk is elevated"
        )

    # Deduplicate while preserving order
    seen = set()
    unique_actions = []
    for a in actions:
        if a not in seen:
            seen.add(a)
            unique_actions.append(a)

    return {
        "risk_level": risk_level,
        "primary_drivers": primary_drivers,
        "recommended_actions": unique_actions,
    }
