import { useMemo } from 'react'
import * as THREE from 'three'

export function useProceduralTextures() {
  return useMemo(() => {
    const stone = makeStoneTexture()
    const metal = makeRibbedMetalTexture()
    const glass = makeGlassTexture()
    const insulation = makeInsulationTexture()
    const thermalGradient = makeFLIRGradientTexture()
    const groundSnow = makeGroundTexture()
    return { stone, metal, glass, insulation, thermalGradient, groundSnow }
  }, [])
}

function makeCanvas(width = 512, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  return { canvas, ctx }
}

/**
 * High-definition mountain stone / granite texture with masonry course lines
 */
function makeStoneTexture() {
  const { canvas, ctx } = makeCanvas(512, 512)
  ctx.fillStyle = '#4B5563'
  ctx.fillRect(0, 0, 512, 512)

  // Natural rock speckle noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const shade = Math.floor(60 + Math.random() * 90)
    ctx.fillStyle = `rgba(${shade}, ${shade + 4}, ${shade + 10}, 0.25)`
    ctx.fillRect(x, y, 2 + Math.random() * 5, 2 + Math.random() * 4)
  }

  // Mortar / stone block lines
  ctx.strokeStyle = '#1E293B'
  ctx.lineWidth = 3
  const rowHeight = 64
  for (let y = 0; y <= 512; y += rowHeight) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()

    // Staggered vertical joints
    const offset = (y / rowHeight) % 2 === 0 ? 0 : 64
    for (let x = offset; x <= 512; x += 128) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + rowHeight)
      ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  tex.anisotropy = 8
  return tex
}

/**
 * Architectural ribbed metal panel texture
 */
function makeRibbedMetalTexture() {
  const { canvas, ctx } = makeCanvas(512, 512)
  ctx.fillStyle = '#64748B'
  ctx.fillRect(0, 0, 512, 512)

  // Corrugation ribs
  const ribSpacing = 32
  for (let x = 0; x < 512; x += ribSpacing) {
    const grad = ctx.createLinearGradient(x, 0, x + ribSpacing, 0)
    grad.addColorStop(0, '#475569')
    grad.addColorStop(0.3, '#94A3B8')
    grad.addColorStop(0.7, '#CBD5E1')
    grad.addColorStop(1, '#334155')
    ctx.fillStyle = grad
    ctx.fillRect(x, 0, ribSpacing - 2, 512)
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(x + ribSpacing - 2, 0, 2, 512)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

/**
 * Insulated double pane glass texture
 */
function makeGlassTexture() {
  const { canvas, ctx } = makeCanvas(256, 256)
  // Subtle blue-tinted reflections
  const grad = ctx.createLinearGradient(0, 0, 256, 256)
  grad.addColorStop(0, 'rgba(186, 230, 253, 0.65)')
  grad.addColorStop(0.4, 'rgba(14, 165, 233, 0.35)')
  grad.addColorStop(0.7, 'rgba(2, 132, 199, 0.45)')
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.7)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)

  // Low-E coating diagonal reflection sheen
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(-50, 100)
  ctx.lineTo(200, -50)
  ctx.stroke()

  // Glazing spacer border
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, 246, 246)

  return new THREE.CanvasTexture(canvas)
}

/**
 * Rigid foam insulation layer texture
 */
function makeInsulationTexture() {
  const { canvas, ctx } = makeCanvas(256, 256)
  ctx.fillStyle = '#F59E0B'
  ctx.fillRect(0, 0, 256, 256)

  // Cellular foam pattern
  ctx.fillStyle = '#D97706'
  for (let x = 8; x < 256; x += 16) {
    for (let y = 8; y < 256; y += 16) {
      ctx.beginPath()
      ctx.arc(x + ((y % 32) ? 4 : -4), y, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

/**
 * Authentic FLIR Thermal Camera rainbow / ironbow gradient texture
 * Blue (Cold, 0) -> Cyan (0.25) -> Green (0.5) -> Yellow/Orange (0.75) -> Red/White (1.0)
 */
function makeFLIRGradientTexture() {
  const { canvas, ctx } = makeCanvas(256, 256)
  const grad = ctx.createLinearGradient(0, 256, 0, 0)
  grad.addColorStop(0.00, '#050c30') // Sub-zero extreme cold
  grad.addColorStop(0.20, '#1d3557') // Cold blue
  grad.addColorStop(0.40, '#00b4d8') // Cyan
  grad.addColorStop(0.60, '#52b788') // Moderate green
  grad.addColorStop(0.75, '#f59e0b') // Warm amber
  grad.addColorStop(0.90, '#ef4444') // Hot thermal red
  grad.addColorStop(1.00, '#fff176') // Maximum heat release (white-yellow)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/**
 * Cold alpine terrain / snowy permafrost texture
 */
function makeGroundTexture() {
  const { canvas, ctx } = makeCanvas(512, 512)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, 512, 512)

  // Patchy snow & frozen gravel
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const isSnow = Math.random() > 0.4
    ctx.fillStyle = isSnow ? 'rgba(224, 242, 254, 0.25)' : 'rgba(30, 41, 59, 0.4)'
    ctx.fillRect(x, y, 4 + Math.random() * 8, 3 + Math.random() * 6)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(12, 12)
  return tex
}
