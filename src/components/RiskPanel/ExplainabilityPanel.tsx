import { motion } from 'framer-motion';
import type { RiskFactor } from '../../services/riskEngine';

interface ExplainabilityPanelProps {
  factors: RiskFactor[];
}

const factorColors: Record<string, string> = {
  temperature: '#FF5C00',
  humidity:    '#508EFF',
  wind:        '#A0C9FF',
  drought:     '#FFC800',
  historical:  '#FFB59A',
};

export default function ExplainabilityPanel({ factors }: ExplainabilityPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: 'rgba(255,92,0,0.2)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1L6.5 4H9L7 6L8 9L5 7.5L2 9L3 6L1 4H3.5L5 1Z" fill="#FF5C00"/>
          </svg>
        </div>
        <span className="section-label">Why This Risk Score?</span>
      </div>

      {factors.map((factor, i) => {
        const pct = Math.round((factor.contribution / factor.maxContribution) * 100);
        const color = factorColors[factor.id] ?? '#FFB59A';

        return (
          <motion.div
            key={factor.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.4 }}
            className="data-card-hover rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{factor.icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#e5e2e1' }}>{factor.label}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(171,137,125,0.8)' }}>{factor.detail}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <span className="text-sm font-bold font-mono" style={{ color }}>
                  +{factor.contribution}
                </span>
                <span className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.5)' }}>
                  /{factor.maxContribution}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(91,65,55,0.2)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.1 + 0.5, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Total row */}
      <div className="divider my-3" />
      <div className="flex items-center justify-between px-3">
        <span className="section-label">Total Risk Score</span>
        <span className="text-sm font-bold font-mono" style={{ color: '#FF5C00' }}>
          {factors.reduce((s, f) => s + f.contribution, 0)}/100
        </span>
      </div>
    </div>
  );
}
