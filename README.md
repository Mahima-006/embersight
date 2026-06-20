# EmberSight

EmberSight is a production-ready intelligence dashboard that **integrates real satellite wildfire detections and weather data** to calculate, explain, and forecast geospatial risk.

## 📸 Screenshots

| Main Dashboard | Risk Analysis Panel |
| :---: | :---: |
| ![Main Dashboard](https://via.placeholder.com/600x400/131313/FF5C00?text=Main+Dashboard) | ![Risk Analysis Panel](https://via.placeholder.com/600x400/131313/FF5C00?text=Risk+Analysis+Panel) |

| Forecast Section | Community Impact |
| :---: | :---: |
| ![Forecast Section](https://via.placeholder.com/600x400/131313/FF5C00?text=Forecast+Section) | ![Community Impact](https://via.placeholder.com/600x400/131313/FF5C00?text=Community+Impact) |

---

## 🏗 Architecture

EmberSight is built on a robust, decoupled architecture separating data ingestion from frontend presentation.

```text
      NASA FIRMS (VIIRS Satellite Data)
      OpenWeather (Meteorological Data)
                    ↓
          Data Processing Layer
           (EmberSight / Python)
                    ↓
        ## 🛠️ Quick Start & API Keys

Since EmberSightAI integrates real-time satellite data and weather feeds, you must provide your own API keys. The system **will not run correctly** without them.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/embersight-ai.git
   cd embersight-ai
   ```

2. **Backend Setup & API Keys:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   **Crucial Step:** Create a `.env` file in the `backend` directory (you can copy `.env.example`). Add your keys:
   ```env
   # 1. NASA FIRMS API Key (Free, takes 2 mins)
   # Get it here: https://firms.modaps.eosdis.nasa.gov/api/
   FIRMS_MAP_KEY=your_nasa_firms_map_key_here

   # 2. OpenWeatherMap API Key (Free)
   # Get it here: https://openweathermap.org/api
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```
   Then start the backend:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd ../
   npm install
   npm run dev
   ```

4. **View the Dashboard:** Navigate to `http://localhost:5173` in your browser.

## 🏗️ Architecture & Technology Stack
          Risk Scoring Engine
      (Deterministic Normalization)
                    ↓
             Forecast Module
       (Decay & Prediction Logic)
                    ↓
            React Dashboard
         (Vite / Tailwind CSS)
```

---

## ⚡ Technical Features

- **Geospatial wildfire visualization**: MapLibre GL JS integration with custom WebGL marker rendering and spread projection cones.
- **Explainable risk scoring**: Transparent deterministic algorithm factoring Temperature, Humidity, Wind, and Historical Fire Density.
- **3-day risk forecasting**: Predicting environmental risk decay based on forward-looking meteorological patterns.
- **Community impact estimation**: Real-time integration with OpenStreetMap (OSM) via Overpass API to estimate population and critical infrastructure proximity.
- **Historical trend analytics**: Granular breakdown of seasonal activity anomalies.
- **Real-time weather integration**: Open-Meteo current and hourly series fetching.

---

## 🏔 Challenges Faced

1. **Handling state-level searches**: Managing edge cases where users search for macro-regions (like "California, USA"). Built a fallback safety to prevent breaking trust with invalid localized queries.
2. **Integrating geospatial coordinates**: Synchronizing MapLibre's rendering context with React state and external API coordinate grids, ensuring smooth UX when translating bounding boxes to radius searches.
3. **Designing an explainable scoring model**: Moving away from "black-box" machine learning to a transparent, weighted arithmetic model that stakeholders can interrogate and trust.
4. **Combining weather and wildfire signals**: Normalizing disparate data structures (FRP intensities from NASA FIRMS and raw humidity/temp/wind from Open-Meteo) into a single unified 0-100 index.
