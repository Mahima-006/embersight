import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { monthlyData } from '../../data/historicalAverages';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="liquid-glass-strong rounded-xl px-3 py-2 text-xs">
      <p className="font-mono mb-1" style={{ color: 'rgba(171,137,125,0.8)' }}>{label}</p>
      <p className="font-semibold" style={{ color: '#FF5C00' }}>
        {payload[0].value.toLocaleString()} incidents
      </p>
    </div>
  );
}

export default function MonthlyActivityChart() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-0.5">Wildfire Activity by Month</p>
          <p className="text-xs" style={{ color: 'rgba(171,137,125,0.6)' }}>Last 12 Months</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: '#FF5C00' }} />
            <span className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.6)' }}>Incidents</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fireGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FF5C00" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FF5C00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(91,65,55,0.2)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(171,137,125,0.6)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(171,137,125,0.5)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="fires"
            stroke="#FF5C00"
            strokeWidth={2}
            fill="url(#fireGradient)"
            dot={{ fill: '#FF5C00', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#FFB59A', stroke: '#FF5C00', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
