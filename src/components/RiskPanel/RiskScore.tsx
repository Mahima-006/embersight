import { motion } from 'framer-motion';
import type { RiskResult } from '../../services/riskEngine';

interface RiskScoreProps {
  result: RiskResult;
  changePct?: number;
  onClick?: () => void;
}

const levelColors = {
  Low: { stroke: '#4ADE80', glow: 'rgba(74,222,128,0.4)', text: '#4ADE80' },
  Moderate: { stroke: '#FFC800', glow: 'rgba(255,200,0,0.4)', text: '#FFC800' },
  High: { stroke: '#FF5C00', glow: 'rgba(255,92,0,0.5)', text: '#FF5C00' },
  Critical: { stroke: '#FF2D00', glow: 'rgba(255,45,0,0.6)', text: '#FF2D00' },
};

export default function RiskScore({ result, changePct, onClick }: RiskScoreProps) {
  const { score, level } = result;
  const colors = levelColors[level];

  // SVG circle gauge params
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      {/* Circular Gauge */}
      <div 
        onClick={onClick}
        className={`relative group ${onClick ? 'cursor-pointer hover:scale-105 transition-all duration-300' : ''}`}
        style={{ width: 140, height: 140 }}
        title={onClick ? "Click to view risk explanation" : undefined}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl animate-pulse"
          style={{ background: colors.glow, opacity: 0.4 }}
        />
        <svg width="140" height="140" viewBox="0 0 160 160" className="relative">
          {/* Background track */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Score arc */}
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            transform="rotate(-90 80 80)"
            style={{ filter: `drop-shadow(0 0 8px ${colors.stroke})` }}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75].map((pct) => {
            const angle = (pct / 100) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 80 + (radius - 12) * Math.cos(rad);
            const y1 = 80 + (radius - 12) * Math.sin(rad);
            const x2 = 80 + (radius - 6) * Math.cos(rad);
            const y2 = 80 + (radius - 6) * Math.sin(rad);
            return (
              <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            );
          })}
          {/* Score text */}
          <text x="80" y="68" textAnchor="middle"
            fill="#e5e2e1"
            fontFamily="Poppins, Inter, sans-serif"
            fontSize="32" fontWeight="700"
            letterSpacing="-1">
            {score}
          </text>
          
          {/* Risk Level */}
          <text x="80" y="88" textAnchor="middle"
            fill={colors.text}
            fontFamily="JetBrains Mono, monospace"
            fontSize="9" fontWeight="700" letterSpacing="1">
            {level.toUpperCase()} RISK
          </text>

          {/* Trend inside circle */}
          {changePct !== undefined && (
            <text x="80" y="106" textAnchor="middle"
              fill={changePct > 0 ? '#FF2D00' : changePct < 0 ? '#4ADE80' : 'rgba(171,137,125,0.6)'}
              fontFamily="JetBrains Mono, monospace"
              fontSize="9" fontWeight="700">
              {changePct > 0 ? `↑ +${changePct}%` : changePct < 0 ? `↓ ${changePct}%` : '• 0%'} vs lw
            </text>
          )}
        </svg>
        {onClick && (
          <span className="absolute bottom-1 text-[8px] font-mono uppercase tracking-wider text-orange-400/60 group-hover:text-[#FF5C00] transition-colors duration-300 select-none">
            [Analyze Score]
          </span>
        )}
      </div>

      {/* Historical change block under gauge */}
      {changePct !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] font-mono px-3 py-1 rounded-full border bg-white/[0.02] flex items-center gap-1.5"
          style={{
            color: changePct > 0 ? '#FF2D00' : changePct < 0 ? '#4ADE80' : 'rgba(171,137,125,0.7)',
            borderColor: changePct > 0 ? 'rgba(255,45,0,0.2)' : changePct < 0 ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: changePct > 0 ? '#FF2D00' : changePct < 0 ? '#4ADE80' : 'rgba(171,137,125,0.7)' }} />
          <span>{changePct > 0 ? `+${changePct}%` : `${changePct}%`} from last week</span>
        </motion.div>
      )}
    </div>
  );
}
