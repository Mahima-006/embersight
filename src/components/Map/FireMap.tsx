import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type FireIncident, severityColors } from '../../types/fire';
import { ZoomIn, ZoomOut, Crosshair, Layers } from 'lucide-react';
import type { LocationEntry } from '../../data/featuredLocations';
import FireDrawer from './FireDrawer';
import { getSpreadDirection, calculateConePolygon } from '../../utils/spread';

interface FireMapProps {
  selectedLocation: LocationEntry | null;
  fires?: FireIncident[];
  onFireSelect?: (fire: FireIncident) => void;
}

const INITIAL_CENTER: [number, number] = [-119.5, 37.5];
const INITIAL_ZOOM = 5.5;

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=get_your_own_key',
};

export default function FireMap({ selectedLocation, fires = [], onFireSelect }: FireMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedFire, setSelectedFire] = useState<FireIncident | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.dark,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.current.on('load', () => {
      addFireMarkers();
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Redraw markers when fires list updates
  useEffect(() => {
    if (!map.current) return;
    if (map.current.isStyleLoaded()) {
      addFireMarkers();
    } else {
      map.current.once('idle', addFireMarkers);
    }
  }, [fires]);

  function addFireMarkers() {
    if (!map.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    fires.forEach(fire => {
      // Create custom marker element
      const el = document.createElement('div');
      el.style.cssText = `
        position: relative;
        width: 20px;
        height: 20px;
        cursor: pointer;
      `;

      const inner = document.createElement('div');
      inner.style.cssText = `
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background: ${severityColors[fire.severity]};
        box-shadow: 0 0 12px ${severityColors[fire.severity]}80;
        animation: pulse-fire 2s ease-in-out infinite;
      `;

      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid ${severityColors[fire.severity]};
        opacity: 0.4;
        animation: ring-expand 2s ease-out infinite;
      `;

      el.appendChild(ring);
      el.appendChild(inner);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([fire.lng, fire.lat])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedFire(fire);
        onFireSelect?.(fire);
        showPopup(fire);
      });

      markersRef.current.push(marker);
    });
  }

  function showPopup(fire: FireIncident) {
    if (!map.current) return;
    popupRef.current?.remove();

    const containmentColor = fire.containment >= 80 ? '#4ADE80'
      : fire.containment >= 50 ? '#FFC800' : '#FF5C00';

    const popupHTML = `
      <div style="padding:16px;min-width:220px;font-family:Inter,sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <p style="font-size:13px;font-weight:600;color:#e5e2e1;letter-spacing:-0.01em;margin:0">${fire.name}</p>
            <p style="font-size:10px;font-family:JetBrains Mono,monospace;color:rgba(171,137,125,0.7);margin:2px 0 0">${fire.agency} · ${fire.state}</p>
          </div>
          <span style="
            padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;
            font-family:JetBrains Mono,monospace;letter-spacing:0.06em;text-transform:uppercase;
            background:${fire.severity === 'critical' ? 'rgba(255,45,0,0.2)' : fire.severity === 'high' ? 'rgba(255,92,0,0.2)' : 'rgba(255,200,0,0.15)'};
            color:${severityColors[fire.severity]};
            border:1px solid ${severityColors[fire.severity]}50;
          ">${fire.severity}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="background:rgba(32,31,31,0.8);border-radius:8px;padding:8px;">
            <p style="font-size:9px;font-family:JetBrains Mono,monospace;color:rgba(171,137,125,0.6);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 3px">Acreage</p>
            <p style="font-size:14px;font-weight:700;color:#e5e2e1;margin:0">${fire.acreage.toLocaleString()}</p>
          </div>
          <div style="background:rgba(32,31,31,0.8);border-radius:8px;padding:8px;">
            <p style="font-size:9px;font-family:JetBrains Mono,monospace;color:rgba(171,137,125,0.6);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 3px">Contained</p>
            <p style="font-size:14px;font-weight:700;color:${containmentColor};margin:0">${fire.containment}%</p>
          </div>
        </div>

        <div style="background:rgba(32,31,31,0.6);border-radius:8px;padding:8px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:9px;font-family:JetBrains Mono,monospace;color:rgba(171,137,125,0.6)">CONTAINMENT</span>
            <span style="font-size:9px;font-family:JetBrains Mono,monospace;color:${containmentColor}">${fire.containment}%</span>
          </div>
          <div style="height:4px;background:rgba(91,65,55,0.3);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${fire.containment}%;background:${containmentColor};border-radius:2px;transition:width 0.5s;"></div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;font-family:JetBrains Mono,monospace;color:rgba(171,137,125,0.5)">
            ${fire.lat.toFixed(4)}°N, ${Math.abs(fire.lng).toFixed(4)}°W
          </span>
          <span style="
            font-size:10px;font-family:JetBrains Mono,monospace;
            padding:2px 6px;border-radius:12px;
            background:${fire.status === 'Active' ? 'rgba(255,92,0,0.15)' : 'rgba(74,222,128,0.1)'};
            color:${fire.status === 'Active' ? '#FF5C00' : '#4ADE80'};
          ">${fire.status}</span>
        </div>
      </div>
    `;

    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '280px',
      offset: 16,
    })
      .setLngLat([fire.lng, fire.lat])
      .setHTML(popupHTML)
      .addTo(map.current!);

    map.current.flyTo({
      center: [fire.lng, fire.lat],
      zoom: 8,
      duration: 1200,
      essential: true,
    });
  }

  // Fly to selected location
  useEffect(() => {
    if (!map.current || !selectedLocation) return;
    popupRef.current?.remove();
    map.current.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: 7,
      duration: 1400,
      essential: true,
    });
  }, [selectedLocation]);

  // Draw spread cone when a fire is selected
  useEffect(() => {
    if (!map.current) return;
    const sourceId = 'spread-cone-source';
    const layerId = 'spread-cone-layer';
    const outlineId = 'spread-cone-outline';

    const removeCone = () => {
      if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current?.getLayer(outlineId)) map.current.removeLayer(outlineId);
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
    };

    removeCone();

    if (selectedFire) {
      const { angle } = getSpreadDirection(selectedFire.id);
      const polygon = calculateConePolygon(selectedFire.lng, selectedFire.lat, angle);
      
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polygon]
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#FF5C00',
          'fill-opacity': 0.15
        }
      });

      map.current.addLayer({
        id: outlineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#FF5C00',
          'line-width': 1,
          'line-dasharray': [2, 2]
        }
      });
    }
  }, [selectedFire]);

  function zoomIn() { map.current?.zoomIn({ duration: 300 }); }
  function zoomOut() { map.current?.zoomOut({ duration: 300 }); }
  function resetView() {
    popupRef.current?.remove();
    map.current?.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM, duration: 800 });
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(14,14,14,0.4) 100%)',
      }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 liquid-glass-strong rounded-xl px-3 py-2.5">
        <p className="section-label mb-2">Severity</p>
        <div className="space-y-1.5">
          {(['critical', 'high', 'moderate', 'low'] as const).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: severityColors[s], boxShadow: `0 0 6px ${severityColors[s]}80` }} />
              <span className="text-xs font-mono capitalize" style={{ color: 'rgba(229,226,225,0.7)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button onClick={zoomIn} className="map-control-btn" title="Zoom in">
          <ZoomIn size={15} />
        </button>
        <button onClick={zoomOut} className="map-control-btn" title="Zoom out">
          <ZoomOut size={15} />
        </button>
        <div className="h-px w-full" style={{ background: 'rgba(91,65,55,0.3)' }} />
        <button onClick={resetView} className="map-control-btn" title="Reset view">
          <Crosshair size={15} />
        </button>
        <button className="map-control-btn" title="Layers">
          <Layers size={15} />
        </button>
      </div>

      {/* Active fires count badge */}
      <div className="absolute top-4 left-4 liquid-glass rounded-xl px-3 py-2">
        <p className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.7)' }}>Active Fires</p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-display" style={{ color: '#FF5C00' }}>
            {fires.filter(f => f.status === 'Active').length}
          </span>
          <span className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.5)' }}>/ {fires.length}</span>
        </div>
      </div>

      {/* Drawer */}
      <FireDrawer fire={selectedFire} onClose={() => setSelectedFire(null)} />
    </div>
  );
}
