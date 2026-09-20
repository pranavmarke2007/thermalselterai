import Navbar from './Navbar'
import Footer from './Footer'
import { ThemeProvider } from '../context/ThemeContext'

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0B1020] text-slate-100">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,212,255,0.12),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(74,222,128,0.08),_transparent_30%)]" />
        <div className="relative">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  )
}
