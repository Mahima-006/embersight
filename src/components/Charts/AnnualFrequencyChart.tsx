import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { annualData } from '../../data/historicalAverages';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: typeof annualData[0] }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="liquid-glass-strong rounded-xl px-3 py-2 text-xs space-y-1">
      <p className="font-mono font-semibold" style={{ color: '#e5e2e1' }}>{label}</p>
      <p style={{ color: '#FF5C00' }}>Fires: <span className="font-bold">{d.fires.toLocaleString()}</span></p>
      <p style={{ color: '#FFB59A' }}>Acreage: <span className="font-bold">{(d.acreage / 1000).toFixed(0)}K</span></p>
      <p style={{ color: '#508EFF' }}>Avg Severity: <span className="font-bold">{d.avgSeverity}/100</span></p>
    </div>
  );
}

const currentYear = 2024;

export default function AnnualFrequencyChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-0.5">Annual Fire Frequency</p>
          <p className="text-xs" style={{ color: 'rgba(171,137,125,0.6)' }}>Comparative Data 2018–2024</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: '#FF5C00' }} />
            <span className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.6)' }}>Current yr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(91,65,55,0.5)' }} />
            <span className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.6)' }}>Historical</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={annualData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(91,65,55,0.2)" />
          <XAxis
            dataKey="year"
            tick={{ fill: 'rgba(171,137,125,0.6)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(171,137,125,0.5)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,92,0,0.05)' }} />
          <Bar dataKey="fires" radius={[4, 4, 0, 0]}>
            {annualData.map(entry => (
              <Cell
                key={entry.year}
                fill={entry.year === currentYear ? '#FF5C00' : 'rgba(91,65,55,0.35)'}
                style={entry.year === currentYear ? { filter: 'drop-shadow(0 0 6px rgba(255,92,0,0.5))' } : {}}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
