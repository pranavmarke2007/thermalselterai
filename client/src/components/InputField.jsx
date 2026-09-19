export default function InputField({ label, unit, value, onChange, min, max, step = 0.1, type = 'number' }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 focus-within:border-[#00D4FF]/60">
        <input
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full bg-transparent text-sm text-slate-100 outline-none"
        />
        {unit ? <span className="text-xs text-[#00D4FF]">{unit}</span> : null}
      </div>
    </label>
  )
}
