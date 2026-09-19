import { Compass } from 'lucide-react'

export default function CompassSlider({ orientation, onChange }) {
  const getHeadingName = (deg) => {
    if (deg >= 337.5 || deg < 22.5) return 'N (North)'
    if (deg >= 22.5 && deg < 67.5) return 'NE (North-East)'
    if (deg >= 67.5 && deg < 112.5) return 'E (East)'
    if (deg >= 112.5 && deg < 157.5) return 'SE (South-East)'
    if (deg >= 157.5 && deg < 202.5) return 'S (Due South - Optimal Solar)'
    if (deg >= 202.5 && deg < 247.5) return 'SW (South-West)'
    if (deg >= 247.5 && deg < 292.5) return 'W (West)'
    return 'NW (North-West)'
  }

  const isOptimalSouth = orientation >= 160 && orientation <= 200

  return (
    <div className="space-y-2.5 rounded-2xl border border-white/10 bg-black/25 p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Compass size={14} className="text-[#00D4FF]" />
          Orientation & Azimuth
        </span>
        <span className="telemetry-badge">
          {orientation}° · {getHeadingName(orientation).split(' ')[0]}
        </span>
      </div>

      {/* Compass Needle Indicator & Slider */}
      <div className="space-y-1.5">
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={orientation}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-[#00D4FF]"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>0° (N)</span>
          <span>90° (E)</span>
          <span className={isOptimalSouth ? 'text-amber-400 font-bold' : ''}>180° (S ★)</span>
          <span>270° (W)</span>
          <span>360°</span>
        </div>
      </div>

      {/* Solar Exposure Telemetry Note */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Heading: {getHeadingName(orientation)}</span>
        {isOptimalSouth ? (
          <span className="text-[#4ADE80] font-medium">✓ Optimal Winter Solar Harvest</span>
        ) : (
          <span className="text-slate-500">Rotate to ~180° for max solar</span>
        )}
      </div>
    </div>
  )
}
