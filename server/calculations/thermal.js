import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const materialsData = JSON.parse(
  readFileSync(join(__dirname, '../data/materials.json'), 'utf8')
)

export const TARGET_MIN = 18
export const TARGET_MAX = 24
export const COMFORT_SETPOINT = 21

export const ALTITUDE_AIR_DENSITY = 0.825 
export const AIR_SPECIFIC_HEAT = 1005

export function findById(list, id) {
  return list.find((item) => item.id === id) || list[0]
}

export function layeredUValue(layers) {
  const rSi = 0.13
  const rSe = 0.04
  const materialResistance = layers.reduce((sum, layer) => {
    if (!layer || !layer.thickness || !layer.conductivity) return sum
    return sum + layer.thickness / layer.conductivity
  }, 0)
  const totalR = rSi + materialResistance + rSe
  return 1 / Math.max(totalR, 0.05)
}

export function orientationFactor(orientationDeg, timeOfDay) {
  if (timeOfDay < 6 || timeOfDay > 18) return 0
  const solarAzimuth = 90 + ((timeOfDay - 6) / 12) * 180
  const azimuthDiff = Math.abs(((orientationDeg - solarAzimuth + 540) % 360) - 180)
  const solarAltitude = Math.sin(((timeOfDay - 6) / 12) * Math.PI)
  const incidentFactor = Math.max(0, Math.cos((azimuthDiff * Math.PI) / 180)) * solarAltitude
  return 0.15 + 0.85 * incidentFactor
}

export function computeAreas(shelter) {
  const {
    length,
    width,
    height,
    shape,
    windowCount,
    windowWidth,
    windowHeight,
    doorWidth,
    doorHeight,
  } = shelter

  const windowArea = Math.max(0, windowCount) * windowWidth * windowHeight
  const doorArea = doorWidth * doorHeight
  const floorArea = length * width

  let grossWallArea = 0
  let grossRoofArea = 0
  let volume = 0

  switch (shape) {
    case 'dome': {
      const radius = Math.max(height, Math.sqrt((length * width) / Math.PI) * 0.9)
      const domeSurface = 2 * Math.PI * radius * radius
      grossWallArea = domeSurface * 0.55
      grossRoofArea = domeSurface * 0.45
      volume = (2 / 3) * Math.PI * Math.pow(radius, 3)
      break
    }
    case 'a-frame': {
      const halfW = width / 2
      const roofSlopeLen = Math.sqrt(halfW * halfW + height * height)
      grossRoofArea = 2 * length * roofSlopeLen
      grossWallArea = 2 * (0.5 * width * height)
      volume = 0.5 * length * width * height
      break
    }
    case 'semi-cylindrical': {
      const radius = height
      grossRoofArea = Math.PI * radius * length
      grossWallArea = 2 * (0.5 * Math.PI * radius * radius)
      volume = 0.5 * Math.PI * radius * radius * length
      break
    }
    case 'rectangular':
    default: {
      grossWallArea = 2 * (length + width) * height
      grossRoofArea = length * width * 1.08
      volume = length * width * height
      break
    }
  }

  const openings = Math.min(windowArea + doorArea, grossWallArea * 0.85)
  const netWallArea = Math.max(1.0, grossWallArea - openings)

  return {
    floorArea,
    wallArea: netWallArea,
    roofArea: Math.max(1.0, grossRoofArea),
    windowArea,
    doorArea,
    grossWallArea,
    volume: Math.max(volume, 10),
    totalEnvelope: netWallArea + grossRoofArea + floorArea + windowArea + doorArea,
  }
}

export function computeThermal(inputs) {
  const {
    ambientTemperature = -8,
    solarIrradiance = 720,
    windSpeed = 4.2,
    humidity = 28,
    sunshineHours = 8.5,
    timeOfDay = 13,
    length = 8,
    width = 6,
    height = 3.2,
    shape = 'rectangular',
    orientation = 170,
    windowCount = 4,
    windowWidth = 1.2,
    windowHeight = 1.1,
    doorWidth = 1.0,
    doorHeight = 2.1,
    wallMaterialId = 'insulated-panel',
    roofMaterialId = 'insulated-roof',
    insulationId = 'xps',
    insulationThickness = 0.08,
    occupancy = 4,
  } = inputs

  const wall = findById(materialsData.walls, wallMaterialId)
  const roof = findById(materialsData.roofs, roofMaterialId)
  const insulation = findById(materialsData.insulation, insulationId)
  const insulationLayer = {
    ...insulation,
    thickness: insulationThickness || insulation.thickness || 0.08,
  }

  const areas = computeAreas({
    length,
    width,
    height,
    shape,
    windowCount,
    windowWidth,
    windowHeight,
    doorWidth,
    doorHeight,
  })

  const wallU = layeredUValue([wall, insulationLayer])
  const roofU = layeredUValue([roof, insulationLayer])
  const floorU = 0.38
  const windowU = materialsData.glazing?.uValue || 1.4
  const doorU = materialsData.door?.uValue || 1.1

  const uaEnvelope =
    wallU * areas.wallArea +
    roofU * areas.roofArea +
    floorU * areas.floorArea +
    windowU * areas.windowArea +
    doorU * areas.doorArea

  const ach = 0.25 + Math.min(1.2, windSpeed * 0.08)
  const mDotCp = (ach / 3600) * areas.volume * ALTITUDE_AIR_DENSITY * AIR_SPECIFIC_HEAT
  const uaTotal = uaEnvelope + mDotCp

  const deltaT = Math.max(COMFORT_SETPOINT - ambientTemperature, 1)
  const conductionWall = wallU * areas.wallArea * deltaT
  const conductionRoof = roofU * areas.roofArea * deltaT
  const conductionFloor = floorU * areas.floorArea * deltaT
  const conductionWindow = windowU * areas.windowArea * deltaT
  const conductionDoor = doorU * areas.doorArea * deltaT
  const infiltrationLoss = mDotCp * deltaT
  const totalHeatLoss = conductionWall + conductionRoof + conductionFloor + conductionWindow + conductionDoor + infiltrationLoss

  const facingExposure = orientationFactor(orientation, timeOfDay)
  const dayClarity = Math.max(0.1, Math.min(1.0, sunshineHours / 9.5))
  
  const windowShgc = materialsData.glazing?.shgc || 0.65
  const solarWindowGain = solarIrradiance * areas.windowArea * windowShgc * facingExposure * dayClarity

  const wallSolAir = solarIrradiance * (areas.wallArea * wall.absorptivity) * (wallU / 20) * facingExposure * dayClarity
  const roofSolAir = solarIrradiance * (areas.roofArea * roof.absorptivity) * (roofU / 20) * 0.85 * dayClarity
  const solarGain = solarWindowGain + wallSolAir + roofSolAir

  const internalHeatGain = occupancy * 80 + 150

  const tempRise = (solarGain + internalHeatGain) / Math.max(uaTotal, 8)
  const indoorTemperature = ambientTemperature + tempRise

  const inComfortBand = indoorTemperature >= TARGET_MIN && indoorTemperature <= TARGET_MAX
  const comfortDelta = indoorTemperature < TARGET_MIN
    ? TARGET_MIN - indoorTemperature
    : indoorTemperature > TARGET_MAX
      ? indoorTemperature - TARGET_MAX
      : 0

  const gainToLossRatio = solarGain / Math.max(totalHeatLoss, 1)
  const rawEfficiency = (gainToLossRatio * 55) + (insulationLayer.thickness * 180) - (comfortDelta * 2.5)
  const thermalEfficiency = Math.max(8, Math.min(96, rawEfficiency))

  return {
    indoorTemperature: Number(indoorTemperature.toFixed(1)),
    heatLoss: Number(totalHeatLoss.toFixed(1)),
    solarGain: Number(solarGain.toFixed(1)),
    thermalEfficiency: Number(thermalEfficiency.toFixed(1)),
    ua: Number(uaTotal.toFixed(2)),
    areas,
    breakdown: {
      wall: Number(conductionWall.toFixed(1)),
      roof: Number(conductionRoof.toFixed(1)),
      floor: Number(conductionFloor.toFixed(1)),
      windows: Number(conductionWindow.toFixed(1)),
      door: Number(conductionDoor.toFixed(1)),
      infiltration: Number(infiltrationLoss.toFixed(1)),
    },
    materials: { wall, roof, insulation: insulationLayer },
    inComfortBand,
  }
}

export function shapeLabel(shape) {
  return {
    rectangular: 'Rectangular',
    dome: 'Geodesic Dome',
    'a-frame': 'A-Frame',
    'semi-cylindrical': 'Semi-Cylindrical',
  }[shape] || shape
}

export { materialsData }

