import { motion } from 'framer-motion'

export default function MetricCard({ label, value, hint, color = '#00D4FF' }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-white/10 bg-[#151B2E]/90 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-[#00D4FF]/30 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: color, opacity: 0.85 }}
      />
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold font-mono tracking-tight" style={{ color }}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-slate-400 truncate">{hint}</p> : null}
    </motion.div>
  )
}
