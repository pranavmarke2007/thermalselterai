import { useSimulator } from '../context/SimulatorContext'
import InputField from './InputField'
import CompassSlider from './CompassSlider'
import { Box, Sliders } from 'lucide-react'

const SHAPES = [
  { id: 'rectangular', label: 'Rectangular (Gabled Roof)', desc: 'Standard residential/field base' },
  { id: 'dome', label: 'Geodesic Dome', desc: 'Minimal surface/volume ratio' },
  { id: 'a-frame', label: 'A-Frame Alpine', desc: 'Snow-shedding steep pitch' },
  { id: 'semi-cylindrical', label: 'Semi-Cylindrical (Quonset)', desc: 'Aerodynamic wind deflection' },
]

export default function ShelterForm() {
  const { inputs, update } = useSimulator()

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
          <Box size={16} className="text-[#00D4FF]" />
          Shelter Architecture
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {(inputs.length * inputs.width).toFixed(1)} m² footprint
        </span>
      </div>

      {/* Geometry Dimensions */}
      <div className="grid grid-cols-3 gap-2.5">
        <InputField
          label="Length"
          unit="m"
          value={inputs.length}
          onChange={(v) => update({ length: Math.max(3, v) })}
          min={3}
          max={30}
          step={0.5}
        />
        <InputField
          label="Width"
          unit="m"
          value={inputs.width}
          onChange={(v) => update({ width: Math.max(3, v) })}
          min={3}
          max={30}
          step={0.5}
        />
        <InputField
          label="Height"
          unit="m"
          value={inputs.height}
          onChange={(v) => update({ height: Math.max(2, v) })}
          min={2}
          max={10}
          step={0.2}
        />
      </div>

      {/* Shape Typology Selector */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider font-mono text-slate-400">
          Structural Typology
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map((shape) => {
            const active = inputs.shape === shape.id
            return (
              <button
                type="button"
                key={shape.id}
                onClick={() => update({ shape: shape.id })}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                  active
                    ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-white shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                    : 'border-white/10 bg-black/25 text-slate-300 hover:border-white/20'
                }`}
              >
                <span className="text-xs font-semibold">{shape.label.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 truncate w-full">{shape.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orientation Compass Slider */}
      <CompassSlider
        orientation={inputs.orientation ?? 170}
        onChange={(deg) => update({ orientation: deg })}
      />

      {/* Openings (Windows and Doors) */}
      <div className="space-y-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          <Sliders size={13} className="text-[#00D4FF]" />
          Apertures & Openings
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <InputField
            label="Windows"
            unit="panes"
            value={inputs.windowCount}
            onChange={(v) => update({ windowCount: Math.round(v) })}
            min={0}
            max={16}
            step={1}
          />
          <InputField
            label="Window Width"
            unit="m"
            value={inputs.windowWidth}
            onChange={(v) => update({ windowWidth: v })}
            min={0.4}
            max={3.0}
            step={0.1}
          />
          <InputField
            label="Window Height"
            unit="m"
            value={inputs.windowHeight}
            onChange={(v) => update({ windowHeight: v })}
            min={0.4}
            max={2.5}
            step={0.1}
          />
          <InputField
            label="Door Dimensions"
            unit="W×H"
            value={inputs.doorWidth}
            onChange={(v) => update({ doorWidth: v })}
            min={0.8}
            max={2.0}
            step={0.1}
          />
        </div>
      </div>
    </div>
  )
}
