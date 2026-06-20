"""
Nominatim geocoding client (OpenStreetMap).
API: https://nominatim.openstreetmap.org

Usage rules (MUST follow):
  - Max 1 request / second — enforced by asyncio.sleep between calls
  - MUST send a descriptive User-Agent identifying your app
"""

import asyncio
import time
from functools import lru_cache

import httpx

NOMINATIM_BASE  = "https://nominatim.openstreetmap.org"
USER_AGENT      = "EmberSightApp/2.0 (student-portfolio-project; hi@example.com)"
HTTP_TIMEOUT    = 10.0

# Rate-limit state (module-level, single process)
_last_request_at: float = 0.0
_MIN_INTERVAL_SEC = 1.2   # slightly above 1 s to be safe

async def _rate_limited_get(url: str, params: dict) -> dict:
    """Issue a GET with rate-limiting and correct User-Agent."""
    global _last_request_at

    elapsed = time.monotonic() - _last_request_at
    if elapsed < _MIN_INTERVAL_SEC:
        await asyncio.sleep(_MIN_INTERVAL_SEC - elapsed)

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.5"
    }

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers=headers) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    _last_request_at = time.monotonic()
    return data

_geocode_cache: dict[str, dict] = {}

async def geocode(query: str) -> dict | None:
    key = query.strip().lower()
    if key in _geocode_cache:
        return _geocode_cache[key]

    params = {
        "q": query,
        "format": "jsonv2",
        "limit": 5,
        "addressdetails": 1,
    }
    results = await _rate_limited_get(f"{NOMINATIM_BASE}/search", params)

    if not results:
        return None

    best = results[0]
    result = {
        "display_name": best.get("display_name", query),
        "lat": float(best["lat"]),
        "lon": float(best["lon"]),
        "type": best.get("type", ""),
        "importance": float(best.get("importance", 0)),
        "addresstype": best.get("addresstype", ""),
        "place_rank": best.get("place_rank", 0),
    }
    _geocode_cache[key] = result
    return result

_reverse_cache: dict[str, dict] = {}

async def reverse_geocode(lat: float, lon: float) -> dict | None:
    key = f"{lat:.3f},{lon:.3f}"
    if key in _reverse_cache:
        return _reverse_cache[key]

    params = {
        "lat": round(lat, 5),
        "lon": round(lon, 5),
        "format": "jsonv2",
        "addressdetails": 1,
        "zoom": 10,
    }
    try:
        data = await _rate_limited_get(f"{NOMINATIM_BASE}/reverse", params)
    except httpx.HTTPStatusError:
        return None

    addr = data.get("address", {})
    city  = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county", "")
    state = addr.get("state_code") or addr.get("state", "")
    country = addr.get("country_code", "").upper()

    parts = [p for p in [city, state] if p]
    place_label = ", ".join(parts) if parts else data.get("display_name", "Unknown")

    result = {
        "display_name": data.get("display_name", "Unknown"),
        "place_label": place_label,
        "country_code": country,
    }
    _reverse_cache[key] = result
    return result
