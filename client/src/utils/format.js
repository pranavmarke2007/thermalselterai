export function formatKw(watts) {
  if (Math.abs(watts) >= 1000) return `${(watts / 1000).toFixed(2)} kW`
  return `${watts.toFixed(0)} W`
}

export function formatKwh(kwh) {
  return `${Number(kwh).toFixed(2)} kWh`
}

export function formatTemp(value) {
  return `${Number(value).toFixed(1)}°C`
}

export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`
}

export function thermalColor(temperature, ambient) {
  const span = Math.max(12, 24 - ambient)
  const t = Math.max(0, Math.min(1, (temperature - ambient) / span))
  if (t < 0.33) {
    const k = t / 0.33
    return lerpColor('#1D4ED8', '#22C55E', k)
  }
  if (t < 0.66) {
    const k = (t - 0.33) / 0.33
    return lerpColor('#22C55E', '#F59E0B', k)
  }
  const k = (t - 0.66) / 0.34
  return lerpColor('#F59E0B', '#EF4444', k)
}

export function lerpColor(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const r = Math.round(ca.r + (cb.r - ca.r) * t)
  const g = Math.round(ca.g + (cb.g - ca.g) * t)
  const bch = Math.round(ca.b + (cb.b - ca.b) * t)
  return `rgb(${r}, ${g}, ${bch})`
}

export function hexToRgb(hex) {
  const n = hex.replace('#', '')
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  }
}

export function heatMapHex(temperature, ambient) {
  const span = Math.max(12, 24 - ambient)
  const t = Math.max(0, Math.min(1, (temperature - ambient) / span))
  if (t < 0.33) return lerpHex('#1D4ED8', '#22C55E', t / 0.33)
  if (t < 0.66) return lerpHex('#22C55E', '#F59E0B', (t - 0.33) / 0.33)
  return lerpHex('#F59E0B', '#EF4444', (t - 0.66) / 0.34)
}

function lerpHex(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const r = Math.round(ca.r + (cb.r - ca.r) * t)
  const g = Math.round(ca.g + (cb.g - ca.g) * t)
  const bv = Math.round(ca.b + (cb.b - ca.b) * t)
  return `#${toHex(r)}${toHex(g)}${toHex(bv)}`
}

function toHex(n) {
  return n.toString(16).padStart(2, '0')
}
