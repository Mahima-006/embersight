import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, ShieldAlert, Thermometer, Droplets, Wind, Flame, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RiskResult } from '../../services/riskEngine';

interface RiskExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: RiskResult | null;
}

export default function RiskExplainDrawer({ isOpen, onClose, result }: RiskExplainDrawerProps) {
  const navigate = useNavigate();
  if (!result) return null;

  const totalScore = result.score;
  const level = result.level;

  // Level badge colors
  const levelBadgeColors = {
    Low: 'bg-green-950/40 text-green-400 border-green-500/30',
    Moderate: 'bg-yellow-950/40 text-yellow-400 border-yellow-500/30',
    High: 'bg-orange-950/40 text-orange-400 border-orange-500/30',
    Critical: 'bg-red-950/40 text-red-400 border-red-500/30',
  }[level];

  // Helper icons for factors
  const getIcon = (id: string) => {
    switch (id) {
      case 'temperature':
        return <Thermometer size={14} className="text-orange-400" />;
      case 'humidity':
        return <Droplets size={14} className="text-blue-400" />;
      case 'wind_speed':
      case 'wind':
        return <Wind size={14} className="text-sky-300" />;
      case 'fire_density':
      case 'drought':
      case 'historical':
        return <Flame size={14} className="text-red-500" />;
      default:
        return <Calculator size={14} className="text-orange-500" />;
    }
  };

  const getFactorColor = (id: string) => {
    switch (id) {
      case 'humidity': return 'text-blue-400';
      case 'wind_speed':
      case 'wind': return 'text-sky-300';
      case 'fire_density': return 'text-red-500';
      default: return 'text-orange-400';
    }
  };

  // Find factors or use standard default mappings
  const factors = result.factors || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Backdrop (clickable) */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute left-4 top-16 bottom-4 w-96 z-50 liquid-glass-strong rounded-2xl p-5 overflow-y-auto flex flex-col gap-4 text-left pointer-events-auto"
            style={{ border: '1px solid rgba(255,92,0,0.25)', background: 'rgba(19,19,19,0.95)', backdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: 'rgba(91,65,55,0.2)' }}>
              <div>
                <span className="text-[10px] font-mono tracking-wider text-orange-500 uppercase px-2 py-0.5 rounded-full bg-orange-950/40 border border-orange-500/30">
                  Risk Engine Diagnostic
                </span>
                <h3 className="font-display font-bold text-base mt-2 text-[#e5e2e1] flex items-center gap-2">
                  <Calculator size={18} className="text-[#FF5C00]" />
                  Risk Explainability
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-all text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Arithmetic Summary */}
            <div className="bg-[#201F1F]/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">Diagnostic Score</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${levelBadgeColors}`}>
                  {level.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-center py-2 border-y border-white/5 my-1">
                <p className="text-3xl font-display font-extrabold text-[#e5e2e1] tracking-tight">
                  {totalScore} <span className="text-lg text-neutral-500 font-normal">/ 100</span>
                </p>
              </div>

              {/* Point equation */}
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">Arithmetic Equation</p>
                <p className="text-[11px] font-mono text-orange-300/90 leading-relaxed font-bold break-all">
                  {factors.map((f, i) => (
                    <span key={f.id}>
                      {i > 0 && ' + '}
                      <span className={getFactorColor(f.id)}>{f.contribution}</span>
                    </span>
                  ))}
                  {' = '}{totalScore}
                </p>
              </div>
            </div>

            {/* Equation Breakdown List */}
            <div className="flex-1 flex flex-col gap-3">
              <p className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider font-bold">Factor Weight Breakdown</p>
              
              <div className="space-y-2">
                {factors.map((f) => {
                  const factorColor = getFactorColor(f.id);
                  const parsedWeight = f.maxContribution;
                  const rawMetric = f.value;
                  const pointPercent = Math.round((f.contribution / parsedWeight) * 100);

                  return (
                    <div key={f.id} className="bg-[#1a1919]/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getIcon(f.id)}
                          <span className="text-xs font-semibold text-neutral-200">{f.label}</span>
                        </div>
                        <span className={`font-mono text-xs font-bold ${factorColor}`}>
                          +{f.contribution} pts <span className="text-[10px] font-normal text-neutral-500">/ {parsedWeight} max</span>
                        </span>
                      </div>

                      {/* Math detail */}
                      <div className="text-[10px] font-mono text-neutral-400 leading-normal flex justify-between bg-black/20 p-2 rounded border border-white/[0.02]">
                        <span>Metric: <strong className="text-neutral-300">{rawMetric}</strong></span>
                        <span>Calc: {pointPercent}% × {parsedWeight}w = {f.contribution}.0</span>
                      </div>

                      {/* Small progress meter */}
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(f.contribution / parsedWeight) * 100}%`,
                            background: f.id === 'humidity' ? '#508EFF'
                                      : f.id === 'wind_speed' || f.id === 'wind' ? '#A0C9FF'
                                      : f.id === 'fire_density' ? '#FF2D00' : '#FF5C00'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation / Footer */}
            <div className="bg-[#201F1F]/30 border border-white/5 rounded-xl p-3 flex flex-col gap-2 text-[10px] leading-relaxed text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-300 font-bold font-mono uppercase tracking-wider text-[9px]">
                <ShieldAlert size={12} className="text-orange-500" />
                Transparency Model
              </div>
              <p>
                The risk engine computes this rating on-the-fly using the following transparent normalization algorithm:
              </p>
              <p className="font-mono bg-black/30 p-2 rounded text-[#FF5C00] text-center border border-white/5 select-all">
                Risk = ∑ (Sub-Score × Factor Weight)
              </p>
              <p className="italic">
                Weights: Temperature (25%), Humidity (30%), Wind Speed (20%), Fire Density / Danger (25%). No hidden machine learning black boxes.
              </p>
              <button 
                onClick={() => { onClose(); navigate('/methodology'); }}
                className="mt-2 w-full py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-orange-400 bg-orange-950/40 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
              >
                <ExternalLink size={12} />
                Read Full Methodology
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
