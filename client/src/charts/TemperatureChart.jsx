import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-[#00D4FF]/30 bg-[#151B2E]/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
      <p className="font-mono font-semibold text-slate-300 border-b border-white/10 pb-1">
        Hour: {label}
      </p>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}:
          </span>
          <span className="font-mono font-bold text-white">{entry.value} °C</span>
        </div>
      ))}
      <div className="pt-1 text-[10px] text-[#4ADE80] font-mono border-t border-white/10">
        Target Comfort: 18°C – 24°C
      </div>
    </div>
  )
}

export default function TemperatureChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
          <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} unit="°C" domain={[-25, 30]} />
          
          {/* Target Comfort Band (18°C – 24°C) */}
          <ReferenceArea
            y1={18}
            y2={24}
            fill="#4ADE80"
            fillOpacity={0.12}
            strokeOpacity={0.3}
            stroke="#4ADE80"
            strokeDasharray="2 2"
          />
          <ReferenceLine y={21} stroke="#4ADE80" strokeDasharray="4 4" strokeOpacity={0.4} />

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />

          {/* Indoor Passive Temperature */}
          <Line
            type="monotone"
            dataKey="indoor"
            name="Passive Indoor"
            stroke="#4ADE80"
            strokeWidth={2.6}
            dot={false}
            animationDuration={800}
          />
          {/* Outdoor Ambient Temperature */}
          <Line
            type="monotone"
            dataKey="outdoor"
            name="Outdoor Ambient"
            stroke="#00D4FF"
            strokeWidth={1.8}
            dot={false}
            animationDuration={800}
          />
          {/* Unheated Reference Baseline */}
          <Line
            type="monotone"
            dataKey="unheated"
            name="Uninsulated Baseline"
            stroke="#64748B"
            strokeWidth={1.4}
            strokeDasharray="4 4"
            dot={false}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
