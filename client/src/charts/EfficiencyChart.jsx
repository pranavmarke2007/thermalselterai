import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

function EfficiencyTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-xl border border-[#00D4FF]/30 bg-[#151B2E]/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
      <p className="font-semibold text-white border-b border-white/10 pb-1">{data.name}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Thermal Efficiency:</span>
        <span className="font-mono font-bold text-[#4ADE80]">{data.efficiency}%</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Predicted Temp:</span>
        <span className="font-mono font-bold text-[#00D4FF]">{data.indoor} °C</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Heat Loss:</span>
        <span className="font-mono text-rose-400">{data.heatLoss} kW</span>
      </div>
    </div>
  )
}

export default function EfficiencyChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="#64748B"
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            interval={0}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip content={<EfficiencyTooltip />} />
          <Bar dataKey="efficiency" radius={[6, 6, 0, 0]} animationDuration={850}>
            {data?.map((entry, index) => {
              // Highlight highest efficiency shape
              const isBest = entry.efficiency > 70
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isBest ? '#4ADE80' : '#00D4FF'}
                  fillOpacity={0.85}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
