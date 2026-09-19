export function envelopeAreas({ length, width, height, shape }) {
  if (shape === 'dome') {
    const radius = Math.max(height, Math.sqrt((length * width) / Math.PI) * 0.85)
    return { radius, wall: 2 * Math.PI * radius * radius * 0.55, roof: 2 * Math.PI * radius * radius * 0.45 }
  }
  if (shape === 'a-frame') {
    const slope = Math.sqrt((width / 2) ** 2 + height ** 2)
    return { slope, wall: width * height, roof: 2 * length * slope }
  }
  if (shape === 'semi-cylindrical') {
    return { radius: height, wall: Math.PI * height * height, roof: Math.PI * height * length }
  }
  return { wall: 2 * (length + width) * height, roof: length * width }
}
