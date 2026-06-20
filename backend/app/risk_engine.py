# EmberSight — Risk Engine
# ─────────────────────────────────────────────────────────────────────────────
# FORMULA:
#   risk_score = Σ (normalized_sub_score_i × weight_i)
#
# WEIGHTS (must add to 1.0):
#   Temperature   25%  — ambient temp drives fuel moisture loss
#   Humidity      30%  — single strongest predictor of ignition likelihood
#   Wind Speed    20%  — governs spread rate once ignited
#   Fire Density  25%  — active FIRMS detections within 50 km / 7 days
#
# NORMALIZATION RANGES (documented, not magic numbers):
#   Temperature:   0 °C  → 0 pts  |  40 °C → 100 pts  (linear)
#   Humidity:     80 %   → 0 pts  |   5 %  → 100 pts  (inverted linear)
#   Wind Speed:    0 km/h → 0 pts  |  60 km/h → 100 pts (linear, capped)
#   Fire Density:  0 detections → 0 pts  |  ≥20 → 100 pts (linear, capped)
#
# RISK LEVELS:
#   0–24  → Low
#   25–49 → Moderate
#   50–74 → High
#   75–100 → Critical
# ─────────────────────────────────────────────────────────────────────────────

from typing import Literal

# ─── Weights ─────────────────────────────────────────────────────────────────
WEIGHT_TEMPERATURE   = 0.25
WEIGHT_HUMIDITY      = 0.30
WEIGHT_WIND          = 0.20
WEIGHT_FIRE_DENSITY  = 0.25

assert abs(
    WEIGHT_TEMPERATURE + WEIGHT_HUMIDITY + WEIGHT_WIND + WEIGHT_FIRE_DENSITY - 1.0
) < 1e-9, "Weights must sum to 1.0"

# ─── Normalization helpers ────────────────────────────────────────────────────

def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def score_temperature(temp_c: float) -> float:
    """0 °C → 0 pts | 40 °C → 100 pts | linear, clamped."""
    return _clamp((temp_c - 0) / (40 - 0) * 100, 0, 100)


def score_humidity(rh_pct: float) -> float:
    """80% → 0 pts | 5% → 100 pts | inverted linear, clamped."""
    return _clamp((80 - rh_pct) / (80 - 5) * 100, 0, 100)


def score_wind(wind_kmh: float) -> float:
    """0 km/h → 0 pts | 60 km/h → 100 pts | linear, clamped."""
    return _clamp((wind_kmh - 0) / (60 - 0) * 100, 0, 100)


def score_fire_density(detections: int) -> float:
    """0 detections → 0 pts | ≥20 detections → 100 pts | linear, clamped."""
    return _clamp(detections / 20 * 100, 0, 100)


# ─── Level classification ─────────────────────────────────────────────────────

RiskLevel = Literal["Low", "Moderate", "High", "Critical"]


def classify_level(score: float) -> RiskLevel:
    if score < 25:
        return "Low"
    if score < 50:
        return "Moderate"
    if score < 75:
        return "High"
    return "Critical"


# ─── Main function ────────────────────────────────────────────────────────────

def compute_risk(
    temp_c: float,
    rh_pct: float,
    wind_kmh: float,
    fire_detections: int,
) -> dict:
    """
    Compute a fully explainable wildfire risk score.

    Returns a dict matching the /risk endpoint contract:
    {
        "risk_score": int,
        "risk_level": str,
        "breakdown": [...],
        ...
    }
    """
    t_score  = score_temperature(temp_c)
    h_score  = score_humidity(rh_pct)
    w_score  = score_wind(wind_kmh)
    fd_score = score_fire_density(fire_detections)

    # Weighted combination (each weight already 0–1; sub-scores 0–100)
    risk_score = round(
        t_score  * WEIGHT_TEMPERATURE +
        h_score  * WEIGHT_HUMIDITY    +
        w_score  * WEIGHT_WIND        +
        fd_score * WEIGHT_FIRE_DENSITY,
        1,
    )
    risk_score_int = int(round(risk_score))

    return {
        "risk_score": risk_score_int,
        "risk_level": classify_level(risk_score),
        "breakdown": [
            {
                "factor": "Temperature",
                "value": f"{temp_c:.1f}°C",
                "sub_score": round(t_score, 1),
                "contribution": round(t_score * WEIGHT_TEMPERATURE, 1),
                "weight_pct": int(WEIGHT_TEMPERATURE * 100),
            },
            {
                "factor": "Humidity",
                "value": f"{rh_pct:.0f}%",
                "sub_score": round(h_score, 1),
                "contribution": round(h_score * WEIGHT_HUMIDITY, 1),
                "weight_pct": int(WEIGHT_HUMIDITY * 100),
            },
            {
                "factor": "Wind Speed",
                "value": f"{wind_kmh:.0f} km/h",
                "sub_score": round(w_score, 1),
                "contribution": round(w_score * WEIGHT_WIND, 1),
                "weight_pct": int(WEIGHT_WIND * 100),
            },
            {
                "factor": "Fire Density",
                "value": f"{fire_detections} detections / 50 km / 7d",
                "sub_score": round(fd_score, 1),
                "contribution": round(fd_score * WEIGHT_FIRE_DENSITY, 1),
                "weight_pct": int(WEIGHT_FIRE_DENSITY * 100),
            },
        ],
    }
