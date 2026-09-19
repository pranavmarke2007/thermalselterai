import { materialsData, computeThermal, shapeLabel, TARGET_MIN, TARGET_MAX } from './thermal.js'

const SHAPES = ['rectangular', 'dome', 'a-frame', 'semi-cylindrical']
const ORIENTATIONS = [90, 135, 160, 170, 180, 190, 210, 270]
const THICKNESSES = [0.06, 0.08, 0.10, 0.12, 0.15]

function scoreDesign(result) {
  const targetMid = (TARGET_MIN + TARGET_MAX) / 2
  const tempDiff = Math.abs(result.indoorTemperature - targetMid)
  const comfortScore = result.inComfortBand ? 50 - tempDiff * 4 : Math.max(0, 20 - tempDiff * 8)
  const lossScore = Math.max(0, 30 - result.heatLoss / 350)
  const solarScore = Math.min(20, result.solarGain / 200)
  const efficiencyBonus = (result.thermalEfficiency / 100) * 20
  return comfortScore + lossScore + solarScore + efficiencyBonus
}

function generateEngineeringRationale(design) {
  const reasons = []
  if (design.orientation >= 160 && design.orientation <= 200) {
    reasons.push(`Due South orientation (${design.orientation}°) maximizes high-altitude winter solar aperture during peak irradiance hours.`)
  }
  if (design.shape === 'a-frame') {
    reasons.push('Steep A-frame pitch sheds heavy Himalayan snow loads while angled roof captures low winter sun angles.')
  } else if (design.shape === 'dome') {
    reasons.push('Geodesic dome minimizes external surface-area-to-volume ratio, cutting conductive envelope heat loss by up to 28%.')
  } else if (design.shape === 'semi-cylindrical') {
    reasons.push('Aerodynamic arched profile deflects severe mountain gale winds, significantly reducing air infiltration rates.')
  } else {
    reasons.push('Rectangular plan facilitates high thermal mass partition walls and deep south-facing sunspaces.')
  }

  if (design.wallId === 'insulated-panel') {
    reasons.push('Continuous SIP polyurethane core eliminates thermal bridging across perimeter walls.')
  } else if (design.wallId === 'stone' || design.wallId === 'rammed-earth') {
    reasons.push('Dense thermal flywheel dampens diurnal freeze-thaw cycles, storing daytime solar heat for sub-zero nights.')
  }

  if (design.insulationId === 'aerogel') {
    reasons.push('Ultra-low conductivity aerogel provides space-grade insulation with minimal envelope thickness.')
  } else if (design.insulationThickness >= 0.10) {
    reasons.push(`${Math.round(design.insulationThickness * 100)} cm continuous insulation barrier ensures envelope U-value < 0.25 W/m²K.`)
  }

  return reasons.join(' ')
}

export function generateRecommendations(inputs, limit = 8) {
  const candidates = []

  for (const shape of SHAPES) {
    for (const orientation of ORIENTATIONS) {
      for (const wall of materialsData.walls) {
        for (const roof of materialsData.roofs) {
          for (const insulation of materialsData.insulation) {
            for (const thickness of THICKNESSES) {
              const candidate = {
                ...inputs,
                shape,
                orientation,
                wallMaterialId: wall.id,
                roofMaterialId: roof.id,
                insulationId: insulation.id,
                insulationThickness: thickness,
              }
              const thermal = computeThermal(candidate)
              const score = scoreDesign(thermal)
              
              candidates.push({
                shape,
                shapeName: shapeLabel(shape),
                orientation,
                wall: wall.name,
                wallId: wall.id,
                roof: roof.name,
                roofId: roof.id,
                insulation: insulation.name,
                insulationId: insulation.id,
                insulationThickness: thickness,
                indoorTemperature: thermal.indoorTemperature,
                heatLoss: thermal.heatLoss,
                solarGain: thermal.solarGain,
                thermalEfficiency: thermal.thermalEfficiency,
                inComfortBand: thermal.inComfortBand,
                score,
              })
            }
          }
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score)

  const unique = []
  const seenShapes = new Map()

  for (const item of candidates) {
    const shapeCount = seenShapes.get(item.shape) || 0
    if (shapeCount < 2 && !unique.some((u) => u.shape === item.shape && u.wallId === item.wallId && u.roofId === item.roofId)) {
      item.rationale = generateEngineeringRationale(item)
      unique.push(item)
      seenShapes.set(item.shape, shapeCount + 1)
    }
    if (unique.length >= limit) break
  }

  const best = unique[0] || candidates[0]
  if (best && !best.rationale) {
    best.rationale = generateEngineeringRationale(best)
  }

  const comfortCandidates = candidates.filter((c) => c.inComfortBand)

  return {
    best,
    alternatives: unique.slice(1),
    comfortCount: comfortCandidates.length,
    evaluated: candidates.length,
  }
}
