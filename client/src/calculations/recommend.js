import materialsData from '../data/materials.json'
import { computeThermal, shapeLabel, TARGET_MIN, TARGET_MAX } from './thermal'

const SHAPES = ['rectangular', 'dome', 'a-frame', 'semi-cylindrical']
const ORIENTATIONS = [90, 135, 160, 170, 180, 190, 210, 270]
const THICKNESSES = [0.06, 0.08, 0.10, 0.12, 0.15]
const THERMAL_MASS_IDS = ['none', 'stone-slab', 'rammed-earth-core', 'pcm-panel', 'water-barrel']

function scoreBreakdown(result) {
  const targetMid = (TARGET_MIN + TARGET_MAX) / 2
  const tempDiff = Math.abs(result.indoorTemperature - targetMid)

  // Comfort comes first: 21C is better than a hotter but uncomfortable room.
  const comfortScore = result.inComfortBand ? 50 - tempDiff * 4 : Math.max(0, 20 - tempDiff * 8)
  const lossScore = Math.max(0, 30 - result.heatLoss / 350)
  const solarScore = Math.min(20, result.solarGain / 200)
  const efficiencyScore = (result.thermalEfficiency / 100) * 20
  const storageScore = Math.min(15, result.storedThermalEnergy * 1.8)
  const total = comfortScore + lossScore + solarScore + efficiencyScore + storageScore

  return {
    comfort: Number(comfortScore.toFixed(1)),
    heatLoss: Number(lossScore.toFixed(1)),
    solar: Number(solarScore.toFixed(1)),
    efficiency: Number(efficiencyScore.toFixed(1)),
    storage: Number(storageScore.toFixed(1)),
    comfortDelta: Number(tempDiff.toFixed(1)),
    total: Number(total.toFixed(1)),
  }
}

function generateEngineeringRationale(design) {
  const reasons = []

  if (design.inComfortBand) {
    reasons.push(`Predicted indoor temperature is ${design.indoorTemperature}C, inside the 18-24C comfort band.`)
  } else if (design.indoorTemperature > TARGET_MAX) {
    reasons.push('Designs hotter than 24C are penalized because they overheat instead of maintaining comfort.')
  } else {
    reasons.push('Designs colder than 18C are penalized because they still need external heating.')
  }

  if (design.orientation >= 160 && design.orientation <= 200) {
    reasons.push(`South-facing orientation (${design.orientation} deg) improves winter solar capture.`)
  }

  if (design.shape === 'a-frame') {
    reasons.push('A-frame geometry helps snow shedding in alpine conditions.')
  } else if (design.shape === 'dome') {
    reasons.push('Geodesic geometry reduces surface-area-to-volume ratio, but it is not selected if it overheats.')
  } else if (design.shape === 'semi-cylindrical') {
    reasons.push('Semi-cylindrical form reduces wind exposure and infiltration risk.')
  } else {
    reasons.push('Rectangular form can provide stable comfort with predictable envelope heat flow and usable thermal mass placement.')
  }

  if (design.wallId === 'insulated-panel') {
    reasons.push('SIP walls reduce conductive losses with continuous insulation.')
  } else if (design.wallId === 'stone' || design.wallId === 'rammed-earth') {
    reasons.push('Dense walls add thermal storage for day-night temperature swings.')
  }

  if (design.insulationId === 'aerogel') {
    reasons.push('Aerogel gives very low conductivity where thickness must be minimized.')
  } else if (design.insulationThickness >= 0.10) {
    reasons.push(`${Math.round(design.insulationThickness * 100)} cm insulation improves envelope U-value.`)
  }

  if (design.thermalMassId === 'pcm-panel') {
    reasons.push('PCM stores daytime surplus heat and releases it after sunset.')
  } else if (design.thermalMassId === 'stone-slab' || design.thermalMassId === 'rammed-earth-core') {
    reasons.push('Local high-mass storage supports night-time comfort without fossil-fuel heating.')
  } else if (design.thermalMassId === 'water-barrel') {
    reasons.push('Water storage gives high specific-heat buffering at low cost.')
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
              for (const thermalMassId of THERMAL_MASS_IDS) {
                const mass = materialsData.thermalMass.find((item) => item.id === thermalMassId)
                const candidate = {
                  ...inputs,
                  shape,
                  orientation,
                  wallMaterialId: wall.id,
                  roofMaterialId: roof.id,
                  insulationId: insulation.id,
                  insulationThickness: thickness,
                  thermalMassId,
                  thermalMassArea: inputs.thermalMassArea || Math.max(8, (inputs.length || 8) * (inputs.width || 6) * 0.25),
                  thermalMassThickness: mass?.thickness ?? inputs.thermalMassThickness ?? 0.08,
                }
                const thermal = computeThermal(candidate)
                const scoring = scoreBreakdown(thermal)

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
                  thermalMass: thermal.materials.thermalMass.name,
                  thermalMassId,
                  thermalMassArea: candidate.thermalMassArea,
                  thermalMassThickness: candidate.thermalMassThickness,
                  storedThermalEnergy: thermal.storedThermalEnergy,
                  indoorTemperature: thermal.indoorTemperature,
                  heatLoss: thermal.heatLoss,
                  solarGain: thermal.solarGain,
                  thermalEfficiency: thermal.thermalEfficiency,
                  inComfortBand: thermal.inComfortBand,
                  scoring,
                  score: scoring.total,
                })
              }
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
    const alreadyListed = unique.some(
      (u) =>
        u.shape === item.shape &&
        u.wallId === item.wallId &&
        u.roofId === item.roofId &&
        u.thermalMassId === item.thermalMassId,
    )

    if (shapeCount < 2 && !alreadyListed) {
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
