import { motion } from 'framer-motion';
import { ShieldAlert, CalendarDays } from 'lucide-react';

interface ForecastData {
  today: number;
  tomorrow: number;
  in_3_days: number;
}

interface ForecastPanelProps {
  forecast: ForecastData | null;
}

export default function ForecastPanel({ forecast }: ForecastPanelProps) {
  if (!forecast) return null;

  const days = [
    { label: 'Today', score: forecast.today },
    { label: 'Tomorrow', score: forecast.tomorrow },
    { label: 'In 3 Days', score: forecast.in_3_days },
  ];

  const getLevel = (score: number) => {
    if (score >= 75) return { label: 'Critical', color: '#FF2D00', bg: 'rgba(255,45,0,0.1)' };
    if (score >= 50) return { label: 'High', color: '#FF5C00', bg: 'rgba(255,92,0,0.1)' };
    if (score >= 25) return { label: 'Moderate', color: '#FFC800', bg: 'rgba(255,200,0,0.08)' };
    return { label: 'Low', color: '#4ADE80', bg: 'rgba(74,222,128,0.08)' };
  };

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 flex flex-col gap-3 text-left">
      {/* Title */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 rounded-sm flex items-center justify-center bg-orange-500/20">
          <CalendarDays size={11} className="text-orange-500" />
        </div>
        <span className="section-label">3-Day Risk Projection</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {days.map((d, i) => {
          const lvl = getLevel(d.score);
          return (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="bg-[#201F1F]/40 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
            >
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{d.label}</span>
              <span className="text-lg font-bold font-mono text-[#e5e2e1]">{d.score}</span>
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border"
                style={{
                  color: lvl.color,
                  backgroundColor: lvl.bg,
                  borderColor: `${lvl.color}30`
                }}
              >
                {lvl.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Honesty disclaimer */}
      <div className="flex gap-2 items-start mt-2 border-t pt-2.5 border-white/5 text-[10px] text-neutral-500 leading-relaxed leading-normal">
        <ShieldAlert size={12} className="text-neutral-500 mt-0.5 flex-shrink-0" />
        <p>
          *Simplified projection computed by feeding forecast weather parameters into the static risk formula. It does not represent a meteorological fire-spread simulation or ignition model.
        </p>
      </div>
    </div>
  );
}
