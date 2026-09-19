import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Cpu,
  Gauge,
  Layers,
  Sun,
  ShieldAlert,
  ArrowRight,
  Compass,
  ThermometerSnowflake,
  Wind,
  Sparkles,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ShelterCanvas from '../3d/ShelterCanvas'
import { useSimulator } from '../context/SimulatorContext'
import { formatTemp, formatKw, formatPercent } from '../utils/format'

const features = [
  {
    icon: Gauge,
    title: 'First-Principles Thermal Engine',
    text: 'Calculates heat loss Q = (k · A · ΔT)/L across layered multi-material envelopes, sol-air absorption, and high-altitude air infiltration.',
  },
  {
    icon: Box,
    title: 'Parametric 3D WebGL Viewer',
    text: 'Interactive real-time Three.js renderer featuring dynamic dimensions, cardinal solar orientation, materials, and FLIR thermal gradient imaging.',
  },
  {
    icon: Cpu,
    title: 'Multi-Objective AI Advisor',
    text: 'Evaluates thousands of envelope combinations across shapes, orientations, and insulation thicknesses to target the 18°C–24°C passive comfort band.',
  },
  {
    icon: Sun,
    title: 'Ladakh High-Altitude Telemetry',
    text: 'Tailored for extreme sub-zero regions (Leh, Kargil, Dras, Nyoma) with live Open-Meteo climate sync and 3,500m atmospheric pressure adjustments.',
  },
]

const climateStats = [
  {
    label: 'Target Indoor Comfort',
    value: '18°C – 24°C',
    sub: 'Without active electrical grid heating',
    color: '#4ADE80',
  },
  {
    label: 'Design Exterior Delta-T',
    value: 'ΔT = 32°C',
    sub: 'Sub-zero baseline down to -25°C',
    color: '#EF4444',
  },
  {
    label: 'Ladakh Solar Resource',
    value: '650–850 W/m²',
    sub: 'Over 300 days of high solar irradiance',
    color: '#F59E0B',
  },
  {
    label: 'High-Altitude Atmosphere',
    value: '3,524 m MSL',
    sub: 'Air density ρ ≈ 0.825 kg/m³ (32% lower)',
    color: '#00D4FF',
  },
]

export default function Home() {
  const { inputs, thermal } = useSimulator()

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-3.5 py-1 text-xs font-mono font-medium text-[#00D4FF]">
            <Sparkles size={13} className="text-[#00D4FF]" />
            <span>Smart India Hackathon · Cold-Region Habitat Systems</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            Passive shelter design for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#38bdf8] to-[#4ADE80]">
              extreme Himalayan cold.
            </span>
          </h1>

          <p className="max-w-2xl text-base text-slate-300 leading-relaxed">
            ThermoShelter AI is an engineering simulation platform that models conductive envelope heat loss,
            solar radiation capture, and diurnal thermal inertia for high-altitude desert climates like Ladakh.
            Design zero-carbon passive shelters that sustain <strong>18°C–24°C</strong> comfort through sub-zero blizzards.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00D4FF] px-6 py-3 text-sm font-bold text-[#0B1020] hover:bg-[#38bdf8] transition shadow-[0_0_25px_rgba(0,212,255,0.35)]"
            >
              Launch Simulator
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/viewer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-[#00D4FF]/40 transition"
            >
              <Box size={16} className="text-[#00D4FF]" />
              3D Interactive Studio
            </Link>
            <Link
              to="/materials"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:border-white/20 transition"
            >
              <Layers size={16} />
              Material Lab
            </Link>
          </div>

          {/* Quick Telemetry Ticker */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Pred. Interior
              </span>
              <span className="text-xl font-mono font-bold text-[#4ADE80]">
                {formatTemp(thermal.indoorTemperature)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Heat Loss
              </span>
              <span className="text-xl font-mono font-bold text-rose-400">
                {formatKw(thermal.heatLoss)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Thermal Efficiency
              </span>
              <span className="text-xl font-mono font-bold text-[#00D4FF]">
                {formatPercent(thermal.thermalEfficiency)}
              </span>
            </div>
          </div>
        </div>

        {/* Hero 3D Live Teaser Card */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/25 bg-[#151B2E]/80 p-4 shadow-[0_0_40px_rgba(0,212,255,0.1)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span className="text-xs font-mono font-semibold uppercase text-slate-200">
                  Live 3D Telemetry Feed
                </span>
              </div>
              <span className="telemetry-badge">
                {inputs.shape} · {inputs.orientation}°
              </span>
            </div>

            <div className="h-[340px] w-full mt-3 overflow-hidden rounded-2xl bg-[#070B16] relative">
              <ShelterCanvas inputs={inputs} thermal={thermal} thermalView={false} />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md text-[11px] text-slate-300">
                <span>Interactive: Drag to rotate · Scroll to zoom</span>
                <Link to="/viewer" className="text-[#00D4FF] hover:underline font-medium">
                  Fullscreen Studio →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* High-Altitude Regional Parameters Banner */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {climateStats.map((stat, i) => (
          <GlassCard key={stat.label} delay={i * 0.08} className="p-5 relative overflow-hidden">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
              {stat.label}
            </span>
            <span
              className="mt-2 block text-2xl font-extrabold font-mono"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="mt-1 block text-xs text-slate-400">{stat.sub}</span>
          </GlassCard>
        ))}
      </section>

      {/* Engineering Features Grid */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#00D4FF]">
            Platform Architecture
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
            Engineering grade building physics for extreme environments.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item, i) => (
            <GlassCard key={item.title} delay={i * 0.1} className="p-6 space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D4FF]/15 text-[#00D4FF]">
                <item.icon size={22} />
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Ladakh Extreme Cold Challenge Deep-Dive */}
      <section className="rounded-3xl border border-white/10 bg-[#151B2E]/60 p-8 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#00D4FF]/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <span className="telemetry-badge text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10">
            High-Altitude Cold Desert Physics
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Why conventional building techniques fail in Ladakh
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            In cold-desert territories such as Ladakh, night temperatures routinely dip between <strong>-15°C and -35°C</strong>.
            Conventional masonry structures without thermal break suffer massive conductive heat bleeding ($Q = \sum k A \Delta T / L$)
            and air infiltration accelerated by mountain valley winds.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            However, Ladakh benefits from <strong>over 300 days of intense high-altitude sunshine</strong> (600–850 W/m²).
            By optimizing orientation to Due South (170°–190°), utilizing heavy thermal flywheels (granite/rammed earth) or
            air-sealed SIP panels with high-performance aerogel/XPS insulation, ThermoShelter AI proves that an interior comfort
            level of <strong>18°C–24°C can be achieved entirely through passive solar gain and thermal envelope retention</strong>.
          </p>
          <div className="pt-2">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00D4FF] hover:underline"
            >
              Read full SIH engineering brief & equations →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
