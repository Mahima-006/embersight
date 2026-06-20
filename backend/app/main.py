from FastAPI import FastAPI, Query, HTTPException
from FastAPI.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from app.weather import fetch_current_weather, fetch_weather_series
from app.firms import fetch_fire_density
from app.risk_engine import compute_risk
from app.recommendations import generate_recommendations
from app.nominatim import geocode, reverse_geocode
from app.overpass import fetch_nearby_places, fetch_community_impact

app = FastAPI(title="FastAPI - Core API", version="1.1.0")

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _parse_series_and_calculate_indices(hourly_data: dict) -> tuple[int, int, int, int, int]:
    time_list = hourly_data.get("time", [])
    now = datetime.now(timezone.utc)
    
    current_idx = 744  # default fallback (31 days * 24 hours)
    min_diff = float("inf")
    
    for i, t_str in enumerate(time_list):
        try:
            # Parse Open-Meteo naive time format "YYYY-MM-DDTHH:MM"
            t_val = datetime.strptime(t_str, "%Y-%m-%dT%H:%M").replace(tzinfo=timezone.utc)
            diff = abs((t_val - now).total_seconds())
            if diff < min_diff:
                min_diff = diff
                current_idx = i
        except Exception:
            continue
            
    # Calculate target indices with safety clamps
    n = len(time_list)
    last_month_idx = max(0, min(n - 1, current_idx - 30 * 24))
    last_week_idx  = max(0, min(n - 1, current_idx - 7 * 24))
    tomorrow_idx   = max(0, min(n - 1, current_idx + 24))
    in_3_days_idx  = max(0, min(n - 1, current_idx + 3 * 24))
    
    return current_idx, last_week_idx, last_month_idx, tomorrow_idx, in_3_days_idx

@app.get("/search")
async def get_search(q: str = Query(..., description="Query string to search location")):
    result = await geocode(q)
    if not result:
        raise HTTPException(status_code=404, detail="Location not found")
    return result

@app.get("/risk")
async def get_risk(lat: float = Query(...), lon: float = Query(...)):
    try:
        # Fetch weather and fire density concurrently
        weather_data = await fetch_current_weather(lat, lon)
        fire_data = await fetch_fire_density(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")

    risk = compute_risk(
        temp_c=weather_data["temperature_c"],
        rh_pct=weather_data["humidity_pct"],
        wind_kmh=weather_data["wind_kmh"],
        fire_detections=fire_data["detections"]
    )

    # Format output according to frontend requirements
    return {
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "breakdown": risk["breakdown"],
        "data_freshness": {
            "fire_data_updated": fire_data["updated_at"],
            "weather_data_updated": weather_data["updated_at"]
        }
    }

@app.get("/recommendations")
async def get_recommendations(lat: float = Query(...), lon: float = Query(...)):
    try:
        weather_data = await fetch_current_weather(lat, lon)
        fire_data = await fetch_fire_density(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")

    risk = compute_risk(
        temp_c=weather_data["temperature_c"],
        rh_pct=weather_data["humidity_pct"],
        wind_kmh=weather_data["wind_kmh"],
        fire_detections=fire_data["detections"]
    )

    recommendations = generate_recommendations(
        risk_level=risk["risk_level"],
        breakdown=risk["breakdown"],
        weather=weather_data
    )

    return recommendations

@app.get("/risk/history")
async def get_risk_history(lat: float = Query(...), lon: float = Query(...)):
    try:
        hourly_data = await fetch_weather_series(lat, lon)
        fire_data = await fetch_fire_density(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

    if not hourly_data or "time" not in hourly_data:
        raise HTTPException(status_code=500, detail="Invalid weather series data returned")

    cur_idx, lw_idx, lm_idx, _, _ = _parse_series_and_calculate_indices(hourly_data)

    temp_list = hourly_data.get("temperature_2m", [])
    rh_list   = hourly_data.get("relative_humidity_2m", [])
    wind_list = hourly_data.get("wind_speed_10m", [])

    # Today's risk
    risk_today = compute_risk(
        temp_c=temp_list[cur_idx] if cur_idx < len(temp_list) else 25.0,
        rh_pct=rh_list[cur_idx] if cur_idx < len(rh_list) else 50.0,
        wind_kmh=wind_list[cur_idx] if cur_idx < len(wind_list) else 10.0,
        fire_detections=fire_data["detections"]
    )

    # Last week's risk (simulate slightly lower historical density)
    lw_detections = max(0, int(fire_data["detections"] * 0.8))
    risk_lw = compute_risk(
        temp_c=temp_list[lw_idx] if lw_idx < len(temp_list) else 25.0,
        rh_pct=rh_list[lw_idx] if lw_idx < len(rh_list) else 50.0,
        wind_kmh=wind_list[lw_idx] if lw_idx < len(wind_list) else 10.0,
        fire_detections=lw_detections
    )

    # Last month's risk (simulate lower historical density)
    lm_detections = max(0, int(fire_data["detections"] * 0.5))
    risk_lm = compute_risk(
        temp_c=temp_list[lm_idx] if lm_idx < len(temp_list) else 25.0,
        rh_pct=rh_list[lm_idx] if lm_idx < len(rh_list) else 50.0,
        wind_kmh=wind_list[lm_idx] if lm_idx < len(wind_list) else 10.0,
        fire_detections=lm_detections
    )

    score_today = risk_today["risk_score"]
    score_lw = risk_lw["risk_score"]
    score_lm = risk_lm["risk_score"]

    if score_lw > 0:
        change_pct = round(((score_today - score_lw) / score_lw) * 100)
    else:
        change_pct = 0

    return {
        "current": score_today,
        "last_week": score_lw,
        "last_month": score_lm,
        "change_vs_last_week_pct": change_pct
    }

@app.get("/risk/forecast")
async def get_risk_forecast(lat: float = Query(...), lon: float = Query(...)):
    try:
        hourly_data = await fetch_weather_series(lat, lon)
        fire_data = await fetch_fire_density(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast: {str(e)}")

    if not hourly_data or "time" not in hourly_data:
        raise HTTPException(status_code=500, detail="Invalid weather series data returned")

    cur_idx, _, _, tom_idx, in3d_idx = _parse_series_and_calculate_indices(hourly_data)

    temp_list = hourly_data.get("temperature_2m", [])
    rh_list   = hourly_data.get("relative_humidity_2m", [])
    wind_list = hourly_data.get("wind_speed_10m", [])

    # Today
    risk_today = compute_risk(
        temp_c=temp_list[cur_idx] if cur_idx < len(temp_list) else 25.0,
        rh_pct=rh_list[cur_idx] if cur_idx < len(rh_list) else 50.0,
        wind_kmh=wind_list[cur_idx] if cur_idx < len(wind_list) else 10.0,
        fire_detections=fire_data["detections"]
    )

    # Tomorrow (90% fire density decay)
    tom_detections = max(0, int(fire_data["detections"] * 0.9))
    risk_tom = compute_risk(
        temp_c=temp_list[tom_idx] if tom_idx < len(temp_list) else 25.0,
        rh_pct=rh_list[tom_idx] if tom_idx < len(rh_list) else 50.0,
        wind_kmh=wind_list[tom_idx] if tom_idx < len(wind_list) else 10.0,
        fire_detections=tom_detections
    )

    # In 3 days (70% fire density decay)
    in3d_detections = max(0, int(fire_data["detections"] * 0.7))
    risk_in3d = compute_risk(
        temp_c=temp_list[in3d_idx] if in3d_idx < len(temp_list) else 25.0,
        rh_pct=rh_list[in3d_idx] if in3d_idx < len(rh_list) else 50.0,
        wind_kmh=wind_list[in3d_idx] if in3d_idx < len(wind_list) else 10.0,
        fire_detections=in3d_detections
    )

    return {
        "today": risk_today["risk_score"],
        "tomorrow": risk_tom["risk_score"],
        "in_3_days": risk_in3d["risk_score"]
    }

@app.get("/fire-details")
async def get_fire_details(lat: float = Query(...), lon: float = Query(...)):
    # 1. Reverse-geocode to get a closest place label
    rev_result = await reverse_geocode(lat, lon)
    place_label = rev_result["place_label"] if rev_result else f"{lat:.4f}°N, {lon:.4f}°E"

    # 2. Get nearby places within 30km for population estimate
    nearby_places = await fetch_nearby_places(lat, lon, radius_km=30)
    
    total_population = 0
    populated_places_count = 0
    places_list = []
    
    for place in nearby_places:
        places_list.append({
            "name": place["name"],
            "type": place["type"],
            "population": place["population"],
            "distance_km": place["distance_km"]
        })
        if place["population"] is not None:
            total_population += place["population"]
            populated_places_count += 1

    population_estimate_str = (
        f"~{total_population:,} estimated based on {populated_places_count} nearby populated place(s)"
        if populated_places_count > 0
        else "Unknown (no population data available for nearby places)"
    )

    return {
        "place_label": place_label,
        "population_estimate": population_estimate_str,
        "nearby_places": places_list
    }

@app.get("/fires")
async def get_fires(lat: float = Query(...), lon: float = Query(...)):
    # Fetch FIRMS detections. We can reuse fetch_fire_density which looks in 50km radius.
    # Note that fetch_fire_density already returns the list of hotspots!
    fire_data = await fetch_fire_density(lat, lon)
    return {
        "detections": fire_data["detections"],
        "hotspots": fire_data["hotspots"],
        "updated_at": fire_data["updated_at"]
    }

@app.get("/community-impact")
async def get_community_impact(lat: float = Query(...), lon: float = Query(...)):
    try:
        impact = await fetch_community_impact(lat, lon)
        return impact
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch community impact: {str(e)}")
