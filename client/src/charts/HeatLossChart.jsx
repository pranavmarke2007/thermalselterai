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

function HeatLossTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-xl border border-rose-500/30 bg-[#151B2E]/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
      <p className="font-semibold text-white border-b border-white/10 pb-1">{data.name}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Total Envelope Loss:</span>
        <span className="font-mono font-bold text-rose-400">{data.heatLoss} kW</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Equilibrium Temp:</span>
        <span className="font-mono font-bold text-[#4ADE80]">{data.indoor} °C</span>
      </div>
      <div className="text-[10px] text-slate-500 pt-1 border-t border-white/10 font-mono">
        R-Value: R-{data.rValue || '0.35'} m²K/W
      </div>
    </div>
  )
}

export default function HeatLossChart({ data }) {
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
            angle={-15}
            textAnchor="end"
            height={40}
          />
          <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} unit=" kW" />
          <Tooltip content={<HeatLossTooltip />} />
          <Bar dataKey="heatLoss" name="Heat Loss (kW)" radius={[6, 6, 0, 0]} animationDuration={900}>
            {data?.map((entry, index) => {
              // Highlight insulated / high-performance panel with cyan/green, high-loss masonry with orange/red
              const isLowLoss = entry.heatLoss < 3.0
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isLowLoss ? '#00D4FF' : entry.heatLoss > 6 ? '#EF4444' : '#F59E0B'}
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
