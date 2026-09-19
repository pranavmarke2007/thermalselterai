import { Eye, Flame, Layers } from 'lucide-react'

const VIEWS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'top', label: 'Top' },
  { id: 'iso', label: 'Iso' },
]

export default function ViewControls({
  onView,
  thermalView,
  onToggleThermal,
  wireframe,
  onToggleWireframe,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Camera View Selector */}
      <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-0.5">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onView(view.id)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-[#00D4FF]/15 hover:text-[#00D4FF]"
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Wireframe Inspection Toggle */}
      {onToggleWireframe && (
        <button
          type="button"
          onClick={onToggleWireframe}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition ${
            wireframe
              ? 'border-[#00D4FF] bg-[#00D4FF]/20 text-[#00D4FF]'
              : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/20'
          }`}
          title="Toggle Structural Wireframe"
        >
          <Layers size={13} />
          Wireframe
        </button>
      )}

      {/* Thermal FLIR Heatmap Toggle */}
      <button
        type="button"
        onClick={onToggleThermal}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1 text-xs font-semibold transition ${
          thermalView
            ? 'border-[#EF4444] bg-gradient-to-r from-[#EF4444] to-[#F59E0B] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            : 'border-white/10 bg-black/40 text-slate-300 hover:border-[#00D4FF]/40 hover:text-white'
        }`}
      >
        {thermalView ? <Flame size={14} className="animate-pulse" /> : <Eye size={14} />}
        {thermalView ? 'Thermal FLIR Active' : 'Normal View'}
      </button>

      {/* Heatmap Legend Bar (Visible when in Thermal View) */}
      {thermalView && (
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-slate-300">
          <span className="text-cyan-400 font-mono">Cold</span>
          <div className="h-2.5 w-16 rounded-full bg-gradient-to-r from-[#1d3557] via-[#52b788] via-[#f59e0b] to-[#ef4444]" />
          <span className="text-rose-400 font-mono">Hot</span>
        </div>
      )}
    </div>
  )
}
