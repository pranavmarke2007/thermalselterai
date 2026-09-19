import { useState } from 'react'
import { useSimulator } from '../context/SimulatorContext'
import InputField from './InputField'
import { CloudSun, MapPin, RefreshCw, Sun, Moon } from 'lucide-react'
import { useWeather, LADAKH_REGIONS } from '../services/weather'

export default function ClimateForm() {
  const { inputs, update } = useSimulator()
  const weather = useWeather()
  const [selectedRegionId, setSelectedRegionId] = useState('leh')

  const handleRegionSelect = async (regionId) => {
    setSelectedRegionId(regionId)
    const region = LADAKH_REGIONS.find((r) => r.id === regionId)
    if (!region) return
    const data = await weather.load(region)
    update({
      ambientTemperature: data.ambientTemperature,
      solarIrradiance: data.solarIrradiance,
      windSpeed: data.windSpeed,
      humidity: data.humidity,
      sunshineHours: data.sunshineHours,
      location: region.name,
      weatherMode: 'auto',
    })
  }

  const handleLiveFetch = async () => {
    const region = LADAKH_REGIONS.find((r) => r.id === selectedRegionId) || LADAKH_REGIONS[0]
    const data = await weather.load(region)
    update({
      ambientTemperature: data.ambientTemperature,
      solarIrradiance: data.solarIrradiance,
      windSpeed: data.windSpeed,
      humidity: data.humidity,
      sunshineHours: data.sunshineHours,
      location: region.name,
      weatherMode: 'auto',
    })
  }

  const timeOfDay = inputs.timeOfDay ?? 13
  const isDay = timeOfDay >= 6 && timeOfDay <= 18
  const timePhase =
    timeOfDay >= 6 && timeOfDay < 11
      ? 'Morning (Ascending Sun)'
      : timeOfDay >= 11 && timeOfDay <= 14
        ? 'Solar Noon (Peak Irradiance)'
        : timeOfDay > 14 && timeOfDay <= 18
          ? 'Afternoon (Descending Sun)'
          : 'Night (Sub-Zero Freeze)'

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
          <CloudSun size={16} className="text-[#00D4FF]" />
          <span>Climate & Site Telemetry</span>
        </div>
        <button
          type="button"
          onClick={handleLiveFetch}
          disabled={weather.status === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-3 py-1 text-xs font-medium text-[#00D4FF] hover:bg-[#00D4FF]/20 transition disabled:opacity-50"
        >
          <RefreshCw size={12} className={weather.status === 'loading' ? 'animate-spin' : ''} />
          {weather.status === 'loading' ? 'Fetching…' : 'Live Sync'}
        </button>
      </div>

      {/* Ladakh Regional Location Selector */}
      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-xs uppercase tracking-wider font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-rose-400" />
            Ladakh Sub-Region
          </span>
          <span className="text-[11px] text-[#00D4FF] lowercase font-normal">
            {inputs.weatherMode === 'auto' ? 'live telemetry' : 'custom manual'}
          </span>
        </label>
        <select
          value={selectedRegionId}
          onChange={(e) => handleRegionSelect(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-[#00D4FF]"
        >
          {LADAKH_REGIONS.map((reg) => (
            <option key={reg.id} value={reg.id} className="bg-[#151B2E]">
              {reg.name} — {reg.desc.slice(0, 48)}…
            </option>
          ))}
        </select>
      </div>

      {weather.error ? (
        <p className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-300">
          {weather.error}
        </p>
      ) : null}

      {/* Time of Day High-Tech Slider */}
      <div className="space-y-1.5 rounded-xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-mono text-slate-300">
            {isDay ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-cyan-400" />}
            Time of Day: {timeOfDay.toString().padStart(2, '0')}:00
          </span>
          <span className="text-[11px] font-mono text-slate-400">{timePhase}</span>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={timeOfDay}
          onChange={(e) => update({ timeOfDay: Number(e.target.value) })}
          className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>00:00 (Night)</span>
          <span>06:00 (Dawn)</span>
          <span className="text-amber-400 font-bold">12:00 (Noon)</span>
          <span>18:00 (Dusk)</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Primary Climate Metric Inputs */}
      <div className="grid grid-cols-2 gap-2.5">
        <InputField
          label="Ambient Temp"
          unit="°C"
          value={inputs.ambientTemperature}
          onChange={(v) => update({ ambientTemperature: v, weatherMode: 'manual' })}
          min={-45}
          max={35}
          step={0.5}
        />
        <InputField
          label="Solar Irradiance"
          unit="W/m²"
          value={inputs.solarIrradiance}
          onChange={(v) => update({ solarIrradiance: v, weatherMode: 'manual' })}
          min={0}
          max={1400}
          step={10}
        />
        <InputField
          label="Wind Velocity"
          unit="m/s"
          value={inputs.windSpeed}
          onChange={(v) => update({ windSpeed: v, weatherMode: 'manual' })}
          min={0}
          max={35}
          step={0.5}
        />
        <InputField
          label="Rel. Humidity"
          unit="%"
          value={inputs.humidity}
          onChange={(v) => update({ humidity: v, weatherMode: 'manual' })}
          min={5}
          max={100}
          step={1}
        />
        <InputField
          label="Sunshine Hours"
          unit="hrs/day"
          value={inputs.sunshineHours}
          onChange={(v) => update({ sunshineHours: v, weatherMode: 'manual' })}
          min={0}
          max={14}
          step={0.5}
        />
        <InputField
          label="Base Occupancy"
          unit="persons"
          value={inputs.occupancy ?? 4}
          onChange={(v) => update({ occupancy: Math.round(v) })}
          min={1}
          max={25}
          step={1}
        />
        <InputField
          label="Analysis Period"
          unit="hrs"
          value={inputs.analysisHours ?? 12}
          onChange={(v) => update({ analysisHours: Math.round(v) })}
          min={1}
          max={72}
          step={1}
        />
      </div>
    </div>
  )
}
