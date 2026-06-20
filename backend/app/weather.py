"""
OpenWeatherMap weather client.
API: https://api.openweathermap.org/data/2.5/weather
API: https://api.openweathermap.org/data/2.5/forecast
Requires OPENWEATHER_API_KEY in environment.
"""
import os
import httpx
from datetime import datetime, timezone

OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"
HTTP_TIMEOUT = 10.0

def _get_api_key():
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        raise ValueError("OPENWEATHER_API_KEY environment variable is missing.")
    return key

async def fetch_current_weather(lat: float, lon: float) -> dict:
    """
    Fetch current temperature, relative humidity, and wind speed.
    """
    params = {
        "lat": round(lat, 4),
        "lon": round(lon, 4),
        "appid": _get_api_key(),
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        resp = await client.get(f"{OPENWEATHER_BASE}/weather", params=params)
        resp.raise_for_status()
        data = resp.json()

    # OpenWeatherMap returns wind speed in meters/second when units=metric
    wind_ms = data.get("wind", {}).get("speed", 0.0)
    wind_kmh = wind_ms * 3.6

    return {
        "temperature_c": data.get("main", {}).get("temp", 0.0),
        "humidity_pct": data.get("main", {}).get("humidity", 50.0),
        "wind_kmh": wind_kmh,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


async def fetch_weather_series(lat: float, lon: float) -> dict:
    """
    Fetch 5-day / 3-hour forecast from OpenWeatherMap.
    We map this into the dictionary structure expected by our risk engine,
    which was originally designed around Open-Meteo's hourly array format.
    """
    params = {
        "lat": round(lat, 4),
        "lon": round(lon, 4),
        "appid": _get_api_key(),
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        resp = await client.get(f"{OPENWEATHER_BASE}/forecast", params=params)
        resp.raise_for_status()
        data = resp.json()

    times = []
    temps = []
    humidities = []
    winds = []

    for item in data.get("list", []):
        # OpenWeather returns dt_txt as "YYYY-MM-DD HH:MM:SS"
        # We convert it to "YYYY-MM-DDTHH:MM" to match our parser
        dt_txt = item.get("dt_txt", "")
        if dt_txt:
            dt_txt = dt_txt.replace(" ", "T")[:16]
        
        times.append(dt_txt)
        temps.append(item.get("main", {}).get("temp", 0.0))
        humidities.append(item.get("main", {}).get("humidity", 50.0))
        
        wind_ms = item.get("wind", {}).get("speed", 0.0)
        winds.append(wind_ms * 3.6)

    return {
        "time": times,
        "temperature_2m": temps,
        "relative_humidity_2m": humidities,
        "wind_speed_10m": winds
    }
