import GlassCard from '../components/GlassCard'
import { BookOpen, Cpu, ShieldCheck, Zap, Layers, Globe } from 'lucide-react'

export default function About() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#00D4FF]">
          Mission Documentation
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
          About ThermoShelter AI
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Smart India Hackathon (SIH) Platform for Passive Shelter Design & Thermal Simulation in High-Altitude Cold Climates.
        </p>
      </div>

      {/* SIH Mission Context */}
      <GlassCard className="p-6 space-y-4 border-[#00D4FF]/25">
        <div className="flex items-center gap-2 text-[#00D4FF]">
          <Globe size={18} />
          <h2 className="text-base font-bold uppercase tracking-wide">The Challenge in Ladakh & Kargil</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          High-altitude cold regions such as Ladakh, Dras, Kargil, and Changthang face severe winter conditions where
          nighttime temperatures collapse to <strong>-15°C to -45°C</strong>. Conventional fossil-fuel heating (diesel generators,
          kerosene bukharis, and coal) creates grave environmental degradation, carbon emissions, indoor respiratory hazards,
          and logistical supply nightmares across snow-blocked mountain passes (e.g., Zoji La and Khardung La).
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>ThermoShelter AI</strong> bridges computational building physics with modern generative design.
          It empowers military outposts, disaster response teams, researchers, and local Himalayan communities to design
          zero-carbon passive shelters that harvest Ladakh’s abundant high-altitude winter solar radiation and maintain an
          interior comfort setpoint of <strong>18°C–24°C</strong> without active fossil-fuel heaters.
        </p>
      </GlassCard>

      {/* Physics Engine & Mathematical Equations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu size={18} className="text-[#00D4FF]" />
          First-Principles Mathematical Formulation
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Equation 1: Conduction */}
          <GlassCard className="p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">1. Conductive Heat Loss</h3>
            <div className="rounded-xl bg-black/40 p-3 font-mono text-xs text-[#00D4FF]">
              Q_loss = (k · A · ΔT) / L = Σ (U_i · A_i · ΔT)
            </div>
            <p className="text-xs text-slate-300">
              Evaluated across multi-layered envelope components (composite walls, roofs, floor slabs, doors, and double glazing).
              Layered resistance $R = R_{"{si}"} + \sum \frac{L_j}{k_j} + R_{"{se}"}$, with U-value $U = 1 / R_{"{total}"}$.
            </p>
          </GlassCard>

          {/* Equation 2: Infiltration */}
          <GlassCard className="p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">2. High-Altitude Infiltration</h3>
            <div className="rounded-xl bg-black/40 p-3 font-mono text-xs text-[#4ADE80]">
              Q_inf = (ACH / 3600) · V · ρ_alpine · C_p · ΔT
            </div>
            <p className="text-xs text-slate-300">
              Adjusted for barometric pressure at 3,500m MSL in Leh (67 kPa), reducing air density $\rho_{"{alpine}"} \approx 0.825\text{ kg/m}^3$
              compared to sea level (1.225 kg/m³), with wind velocity and moisture corrections.
            </p>
          </GlassCard>

          {/* Equation 3: Solar Gain */}
          <GlassCard className="p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">3. Direct & Sol-Air Solar Harvest</h3>
            <div className="rounded-xl bg-black/40 p-3 font-mono text-xs text-amber-400">
              SolarGain = I_solar · A_win · SHGC · cos(θ) + Q_solair
            </div>
            <p className="text-xs text-slate-300">
              Accounts for solar altitude and azimuth angle relative to the shelter orientation (0°–360°),
              glazing Solar Heat Gain Coefficient (SHGC = 0.65), and opaque exterior envelope sol-air heat transfer.
            </p>
          </GlassCard>

          {/* Equation 4: Equilibrium */}
          <GlassCard className="p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white">4. Passive Indoor Equilibrium</h3>
            <div className="rounded-xl bg-black/40 p-3 font-mono text-xs text-[#38bdf8]">
              T_indoor = T_ambient + (Q_solar + Q_internal) / UA_total
            </div>
            <p className="text-xs text-slate-300">
              Calculates net thermal balance including internal metabolic heat (occupancy $\times$ 80W) and appliance loads,
              targeting steady-state maintenance within the 18°C–24°C human comfort envelope.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Tech Stack Specs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-[#00D4FF]" />
          Production Tech Stack
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Frontend & 3D WebGL',
              tech: 'React 19 + Vite 8 + Three.js + React Three Fiber + Drei',
              desc: 'High-performance interactive 3D shelter rendering with dynamic geometries, procedural PBR textures, and FLIR thermal gradient visualization.',
            },
            {
              title: 'UI Design & Charts',
              tech: 'Tailwind CSS + Recharts + Framer Motion + Lucide React',
              desc: 'Dark futuristic NASA/Tesla design system with glassmorphism cards, glowing telemetry HUD, and animated diurnal performance curves.',
            },
            {
              title: 'Backend & Meteorological Data',
              tech: 'Node.js + Express + MongoDB + Open-Meteo API',
              desc: 'RESTful calculation endpoints, simulation persistence with automatic in-memory fallback, and live high-altitude Ladakh climate telemetry.',
            },
          ].map((item) => (
            <GlassCard key={item.title} className="p-5 space-y-2">
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="font-mono text-xs text-[#00D4FF]">{item.tech}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  )
}
