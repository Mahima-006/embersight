import { motion } from 'framer-motion';
import { Users, School, Landmark, ShieldAlert } from 'lucide-react';

interface ImpactData {
  population_estimate: number;
  schools_nearby: number;
  hospitals_nearby: number;
}

interface CommunityImpactPanelProps {
  impact: ImpactData | null;
}

export default function CommunityImpactPanel({ impact }: CommunityImpactPanelProps) {
  if (!impact) return null;

  const cards = [
    {
      label: 'Est. Population',
      value: impact.population_estimate > 0 ? impact.population_estimate.toLocaleString() : 'N/A',
      icon: Users,
      color: '#508EFF',
      bg: 'rgba(80,142,255,0.1)'
    },
    {
      label: 'Schools Nearby',
      value: impact.schools_nearby,
      icon: School,
      color: '#FFC800',
      bg: 'rgba(255,200,0,0.08)'
    },
    {
      label: 'Medical Facilities',
      value: impact.hospitals_nearby,
      icon: Landmark,
      color: '#4ADE80',
      bg: 'rgba(74,222,128,0.08)'
    }
  ];

  return (
    <div className="liquid-glass-strong rounded-2xl p-4 flex flex-col gap-3 text-left">
      {/* Title */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4 rounded-sm flex items-center justify-center bg-blue-500/20">
          <Landmark size={11} className="text-blue-400" />
        </div>
        <span className="section-label">Community Exposure & Impact</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="bg-[#201F1F]/40 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border"
                style={{
                  color: card.color,
                  backgroundColor: card.bg,
                  borderColor: `${card.color}25`
                }}
              >
                <Icon size={14} />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{card.label}</span>
              <span className="text-sm font-bold font-mono text-[#e5e2e1]">{card.value}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Honesty note */}
      <div className="flex gap-2 items-start mt-2 border-t pt-2.5 border-white/5 text-[10px] text-neutral-500 leading-normal italic">
        <ShieldAlert size={12} className="text-neutral-500 mt-0.5 flex-shrink-0" />
        <p>
          *Population count is estimated by summing the populations of nearby towns and cities (within 30km). It is not a precise demographic census count.
        </p>
      </div>
    </div>
  );
}
