import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function SolarGainTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-amber-500/30 bg-[#151B2E]/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
      <p className="font-semibold text-white border-b border-white/10 pb-1 font-mono">
        Time: {label}
      </p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-amber-400">Total Solar Harvest:</span>
        <span className="font-mono font-bold text-white">{payload[0].value} kW</span>
      </div>
      <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 font-mono">
        Direct Glazing + Opaque Sol-Air
      </div>
    </div>
  )
}

export default function SolarGainChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="solarHarvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.75} />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
          <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} unit=" kW" />
          <Tooltip content={<SolarGainTooltip />} />
          <Area
            type="monotone"
            dataKey="solarGain"
            name="Solar Harvest"
            stroke="#F59E0B"
            strokeWidth={2.4}
            fill="url(#solarHarvest)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
