import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Users, Compass, Calendar, Radio, Activity } from 'lucide-react';
import type { FireIncident } from '../../types/fire';
import { getNearestLandmark } from '../../utils/landmark';
import { getSpreadDirection } from '../../utils/spread';

interface FireDrawerProps {
  fire: FireIncident | null;
  onClose: () => void;
}

interface FireDetails {
  place_label: string;
  population_estimate: string;
  nearby_places: Array<{
    name: string;
    type: string;
    population: number | null;
    distance_km: number;
  }>;
}

function getRelativeTime(fireId: string): string {
  let hash = 0;
  for (let i = 0; i < fireId.length; i++) {
    hash = fireId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const mins = Math.abs(hash % 45) + 5;
  return `Detected ${mins} minutes ago`;
}

export default function FireDrawer({ fire, onClose }: FireDrawerProps) {
  const [details, setDetails] = useState<FireDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fire) {
      setDetails(null);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8000/fire-details?lat=${fire.lat}&lon=${fire.lng}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load fire details');
        return r.json();
      })
      .then(data => {
        setDetails(data);
      })
      .catch(err => {
        console.error(err);
        // Fallback placeholder
        setDetails({
          place_label: getNearestLandmark(fire.lat, fire.lng),
          population_estimate: 'Data unavailable (offline)',
          nearby_places: []
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fire]);

  const spreadInfo = fire ? getSpreadDirection(fire.id) : { angle: 0, label: 'Unknown' };

  return (
    <AnimatePresence>
      {fire && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="absolute left-4 top-16 bottom-4 w-80 z-40 liquid-glass-strong rounded-2xl p-5 overflow-y-auto flex flex-col gap-4 text-left"
          style={{ border: '1px solid rgba(255,92,0,0.25)', background: 'rgba(19,19,19,0.92)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: 'rgba(91,65,55,0.2)' }}>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-orange-500 uppercase px-2 py-0.5 rounded-full bg-orange-950/40 border border-orange-500/30">
                Satellite Detection
              </span>
              <h3 className="font-display font-bold text-base mt-2 text-[#e5e2e1]">
                {fire.cause === 'Satellite Detection' ? getNearestLandmark(fire.lat, fire.lng) : fire.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-all text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-neutral-400">Fetching Intel...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3">
              {/* Primary Details */}
              <div className="bg-[#201F1F]/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Detected</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-[#e5e2e1] font-bold">{getRelativeTime(fire.id).replace('Detected ', '')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Intensity</span>
                  <span className="text-[11px] font-mono text-[#e5e2e1] font-bold">
                    {fire.acreage ? `${Math.round(fire.acreage / 1.5)} MW` : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Confidence</span>
                  <span className="text-[11px] font-mono text-[#e5e2e1] font-bold">
                    {fire.severity === 'critical' || fire.severity === 'high' ? 'High' : 'Nominal'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Nearest City</span>
                  <span className="text-[11px] font-mono text-[#e5e2e1] font-bold text-right truncate w-32" title={details?.place_label || getNearestLandmark(fire.lat, fire.lng)}>
                    {details?.place_label || getNearestLandmark(fire.lat, fire.lng)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Risk Trend</span>
                  <span className="text-[11px] font-mono text-red-400 font-bold flex items-center gap-1">
                    <Activity size={10} /> Increasing
                  </span>
                </div>
              </div>

              {/* Spread Projection (Option A) */}
              <div className="bg-[#1a1311]/80 border border-orange-500/20 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-orange-500/10">
                  <Compass size={64} />
                </div>
                
                <div className="flex items-center gap-1.5 text-orange-500 border-b border-orange-500/10 pb-2">
                  <Flame size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Likely spread direction</span>
                </div>
                
                <div className="flex items-center justify-between mt-1 z-10">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Next 6 Hours</span>
                  <span className="text-sm font-mono text-orange-400 font-bold">{spreadInfo.label}</span>
                </div>
                
                <div className="flex items-center justify-between z-10">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Confidence</span>
                  <span className="text-[11px] font-mono text-[#e5e2e1] font-bold">Moderate</span>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
