import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Moon, Sun, ThermometerSun, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/simulator', label: 'Studio' },
  { to: '/comparison', label: 'Comparison' },
  { to: '/materials', label: 'Materials' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1020]/75 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-white group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#4ADE80]/20 border border-[#00D4FF]/40 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)] group-hover:scale-105 transition">
            <ThermometerSun size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wide text-white">
                ThermoShelter<span className="text-[#00D4FF]">AI</span>
              </span>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#00D4FF] text-[#0B1020] font-bold shadow-[0_0_15px_rgba(0,212,255,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="md:hidden text-slate-300 hover:text-white p-1 rounded-lg border border-white/10 bg-black/20"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open ? (
        <div className="border-t border-white/10 bg-[#0B1020]/95 px-4 py-4 md:hidden backdrop-blur-2xl space-y-2">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 font-bold'
                    : 'text-slate-300 hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </header>
  )
}
