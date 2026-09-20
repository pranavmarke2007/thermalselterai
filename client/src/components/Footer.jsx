import { Link } from 'react-router-dom'
import { ThermometerSun } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0B1020]/90 backdrop-blur-xl py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D4FF]/15 text-[#00D4FF]">
              <ThermometerSun size={18} />
            </span>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">
                ThermoShelter<span className="text-[#00D4FF]">AI</span>
              </span>
              <p className="text-xs text-slate-400 font-mono">
                Smart India Hackathon · Cold-Region Habitat Systems
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-slate-400">
            <Link to="/" className="hover:text-[#00D4FF] transition">Home</Link>
            <Link to="/simulator" className="hover:text-[#00D4FF] transition">Studio</Link>
            <Link to="/comparison" className="hover:text-[#00D4FF] transition">Comparison</Link>
            <Link to="/materials" className="hover:text-[#00D4FF] transition">Material Lab</Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>
            Designed for extreme cold climates (Leh, Dras, Kargil, Nyoma · 3,500m MSL).
          </p>
          <p className="flex items-center gap-1">
            Built with React 19, Three.js, R3F, Node.js & Express.
          </p>
        </div>
      </div>
    </footer>
  )
}
