import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-2xl border border-white/10 bg-[#151B2E]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,212,255,0.06)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
