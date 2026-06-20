"""
NASA FIRMS fire-density client.
API: https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{source}/{W,S,E,N}/{day_range}

A MAP_KEY can be obtained at: https://firms.modaps.eosdis.nasa.gov/api/
Set FIRMS_MAP_KEY in .env.
"""

import math
import os
from datetime import datetime, timezone
import httpx

HTTP_TIMEOUT = 15.0

# Default search radius and look-back window
RADIUS_KM  = 50
DAY_RANGE  = 5

# FIRMS VIIRS SNPP Near Real-Time — best latency for recent fires
FIRMS_SOURCE = "VIIRS_SNPP_NRT"
FIRMS_BASE   = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

def _get_api_key():
    key = os.getenv("FIRMS_MAP_KEY")
    if not key:
        raise ValueError("FIRMS_MAP_KEY environment variable is missing.")
    return key

def _bbox(lat: float, lon: float, radius_km: float) -> tuple[float, float, float, float]:
    """
    Compute a bounding box around (lat, lon) that fully contains a circle
    of radius_km.  Returns (west, south, east, north).
    """
    # 1 degree latitude ≈ 111.32 km
    lat_delta = radius_km / 111.32
    # longitude degrees shrink toward poles
    lon_delta = radius_km / (111.32 * math.cos(math.radians(lat)))
    return (
        round(lon - lon_delta, 4),
        round(lat - lat_delta, 4),
        round(lon + lon_delta, 4),
        round(lat + lat_delta, 4),
    )

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    Δφ = math.radians(lat2 - lat1)
    Δλ = math.radians(lon2 - lon1)
    a = math.sin(Δφ / 2) ** 2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

async def fetch_fire_density(lat: float, lon: float) -> dict:
    """
    Fetch VIIRS SNPP fire detections within RADIUS_KM of (lat, lon)
    over the last DAY_RANGE days.
    """
    map_key = _get_api_key()

    west, south, east, north = _bbox(lat, lon, RADIUS_KM)
    area_str = f"{west},{south},{east},{north}"
    url = f"{FIRMS_BASE}/{map_key}/{FIRMS_SOURCE}/{area_str}/{DAY_RANGE}"

    try:
        print("FIRMS URL:", url)

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(url)

            print("FIRMS STATUS:", resp.status_code)
            print("FIRMS RESPONSE:", resp.text[:500])

            resp.raise_for_status()
            csv_text = resp.text

    except Exception as exc:
        raise RuntimeError(
            f"FIRMS URL: {url} | FIRMS API request failed: {exc}"
        )
    # Parse CSV (FIRMS returns header + rows)
    lines = csv_text.strip().split("\n")
    if len(lines) < 2:
        hotspots = []
    else:
        headers = [h.strip() for h in lines[0].split(",")]
        hotspots = []
        for row in lines[1:]:
            cols = row.split(",")
            if len(cols) < len(headers):
                continue
            record = dict(zip(headers, [c.strip() for c in cols]))
            try:
                rlat = float(record.get("latitude", 0))
                rlon = float(record.get("longitude", 0))
                dist = _haversine_km(lat, lon, rlat, rlon)
                if dist <= RADIUS_KM:
                    hotspots.append({
                        "lat": rlat,
                        "lon": rlon,
                        "frp": float(record.get("frp", 0) or 0),       # Fire Radiative Power (MW)
                        "confidence": record.get("confidence", "n"),
                        "satellite": record.get("satellite", ""),
                        "acq_date": record.get("acq_date", ""),
                        "acq_time": record.get("acq_time", ""),
                        "distance_km": round(dist, 1),
                    })
            except (ValueError, KeyError):
                continue

    return {
        "detections": len(hotspots),
        "hotspots": hotspots,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "FIRMS_VIIRS_SNPP_NRT",
    }
