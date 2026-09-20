import { useState } from 'react'
import materials from '../data/materials.json'
import GlassCard from '../components/GlassCard'
import { Search } from 'lucide-react'

function MaterialCard({ item, type }) {
  const rVal = item.rValue || (item.thickness / item.conductivity).toFixed(2)
  return (
    <GlassCard className="p-5 space-y-3 relative overflow-hidden border-[#00D4FF]/15">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {type.toUpperCase()}
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">{item.name}</h3>
        </div>
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-white/20 shadow-md"
          style={{ backgroundColor: item.color }}
        />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">{item.description}</p>

      {/* Physics Properties Matrix */}
      <dl className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs font-mono">
        <div>
          <span className="text-slate-500 text-[10px] block">Conductivity (k)</span>
          <span className="text-[#00D4FF] font-semibold">{item.conductivity} W/mK</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Thermal Resistance</span>
          <span className="text-[#4ADE80] font-semibold">R-{rVal} m²K/W</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Density (ρ)</span>
          <span className="text-slate-300 font-semibold">{item.density} kg/m³</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Specific Heat (Cp)</span>
          <span className="text-slate-300 font-semibold">{item.specificHeat} J/kgK</span>
        </div>
      </dl>

      {/* Sustainability & Availability */}
      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
        <span>Ladakh: <strong className="text-slate-200">{item.localAvailability || 'Native'}</strong></span>
        <span>Carbon: <strong className="text-slate-200">{item.embodiedCarbon || 'Low'}</strong></span>
      </div>
    </GlassCard>
  )
}

export default function MaterialLibrary() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const allItems = [
    ...materials.walls.map((m) => ({ ...m, category: 'walls', categoryLabel: 'Wall' })),
    ...materials.roofs.map((m) => ({ ...m, category: 'roofs', categoryLabel: 'Roof' })),
    ...materials.insulation.map((m) => ({ ...m, category: 'insulation', categoryLabel: 'Insulation' })),
  ]

  const filtered = allItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#00D4FF]">
            Architectural Material Science
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
            Cold-Region Material Library
          </h1>
        </div>
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials, k-values…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00D4FF]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Envelope Materials' },
          { id: 'walls', label: 'Wall Assemblies' },
          { id: 'roofs', label: 'Roof Structures' },
          { id: 'insulation', label: 'Insulation Cores' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[#00D4FF] text-[#0B1020] shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                : 'border border-white/10 bg-black/20 text-slate-300 hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <MaterialCard key={`${item.category}-${item.id}`} item={item} type={item.categoryLabel} />
        ))}
      </div>

      {/* Special Glazing & Door Envelope Summary Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-5 space-y-2 border-[#00D4FF]/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Glazing Specification: {materials.glazing.name}</h3>
            <span className="telemetry-badge text-[#00D4FF]">U = {materials.glazing.uValue} W/m²K</span>
          </div>
          <p className="text-xs text-slate-300">
            High-altitude argon-filled double glazing with Low-Emissivity silver coating. Solar Heat Gain Coefficient (SHGC)
            of <strong>0.65</strong> captures incoming shortwave solar radiation while blocking longwave heat re-radiation.
          </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-2 border-[#00D4FF]/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Door Specification: {materials.door.name}</h3>
            <span className="telemetry-badge text-[#4ADE80]">U = {materials.door.uValue} W/m²K</span>
          </div>
          <p className="text-xs text-slate-300">
            Thermal-break polyurethane core entrance with double perimeter silicone compression seals. Prevents
            high-altitude gale infiltration and freeze-thaw lock jamming at -30°C.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
