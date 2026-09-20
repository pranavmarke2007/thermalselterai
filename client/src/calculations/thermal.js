import materialsData from '../data/materials.json'

export const TARGET_MIN = 18
export const TARGET_MAX = 24
export const COMFORT_SETPOINT = 21

// High-altitude atmospheric correction (Leh, Ladakh at ~3,500m elevation)
// Sea level air density = 1.225 kg/m3; at 3,500m elevation = ~0.825 kg/m3
export const ALTITUDE_AIR_DENSITY = 0.825 
export const AIR_SPECIFIC_HEAT = 1005 // J/kg·K

export function findById(list, id) {
  return list.find((item) => item.id === id) || list[0]
}

/**
 * Calculates total layered U-value (W/m²K)
 * R_total = R_interior_film + sum(thickness / conductivity) + R_exterior_film
 */
export function layeredUValue(layers) {
  const rSi = 0.13 // Interior surface resistance m²K/W
  const rSe = 0.04 // Exterior surface resistance m²K/W
  const materialResistance = layers.reduce((sum, layer) => {
    if (!layer || !layer.thickness || !layer.conductivity) return sum
    return sum + layer.thickness / layer.conductivity
  }, 0)
  const totalR = rSi + materialResistance + rSe
  return 1 / Math.max(totalR, 0.05)
}

/**
 * Calculates solar incidence factor based on orientation (0°-360°) and time of day (0-23h).
 * In Ladakh (Northern Hemisphere, 34°N), 180° (South) maximizes solar winter capture.
 */
export function orientationFactor(orientationDeg, timeOfDay) {
  if (timeOfDay < 6 || timeOfDay > 18) return 0
  // Solar azimuth swings from East (90°) at 6:00 to South (180°) at 12:00 to West (270°) at 18:00
  const solarAzimuth = 90 + ((timeOfDay - 6) / 12) * 180
  const azimuthDiff = Math.abs(((orientationDeg - solarAzimuth + 540) % 360) - 180)
  // Solar elevation angle (peaks at ~40° in winter, ~75° in summer)
  const solarAltitude = Math.sin(((timeOfDay - 6) / 12) * Math.PI)
  const incidentFactor = Math.max(0, Math.cos((azimuthDiff * Math.PI) / 180)) * solarAltitude
  // Direct + diffuse ambient baseline (high-altitude diffuse reflection)
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
      // Hemispherical / geodesic dome
      const radius = Math.max(height, Math.sqrt((length * width) / Math.PI) * 0.9)
      const domeSurface = 2 * Math.PI * radius * radius
      grossWallArea = domeSurface * 0.55
      grossRoofArea = domeSurface * 0.45
      volume = (2 / 3) * Math.PI * Math.pow(radius, 3)
      break
    }
    case 'a-frame': {
      // Triangular steep roof extending to ground plinth
      const halfW = width / 2
      const roofSlopeLen = Math.sqrt(halfW * halfW + height * height)
      grossRoofArea = 2 * length * roofSlopeLen
      grossWallArea = 2 * (0.5 * width * height) // front & rear gables
      volume = 0.5 * length * width * height
      break
    }
    case 'semi-cylindrical': {
      // Quonset / arched tunnel shelter
      const radius = height
      grossRoofArea = Math.PI * radius * length
      grossWallArea = 2 * (0.5 * Math.PI * radius * radius) // front & rear circular semicircles
      volume = 0.5 * Math.PI * radius * radius * length
      break
    }
    case 'rectangular':
    default: {
      grossWallArea = 2 * (length + width) * height
      grossRoofArea = length * width * 1.08 // slight gabled overhang pitch
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
    humidity: _humidity = 28,
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
    thermalMassId = 'stone-slab',
    thermalMassArea = 12,
    thermalMassThickness = 0.08,
    analysisHours = 12,
    occupancy = 4,
  } = inputs

  const wall = findById(materialsData.walls, wallMaterialId)
  const roof = findById(materialsData.roofs, roofMaterialId)
  const insulation = findById(materialsData.insulation, insulationId)
  const thermalMassMaterial = findById(materialsData.thermalMass, thermalMassId)
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

  // Envelope U-values (W/m²·K)
  const wallU = layeredUValue([wall, insulationLayer])
  const roofU = layeredUValue([roof, insulationLayer])
  const floorU = 0.38 // Insulated perimeter earth slab
  const windowU = materialsData.glazing.uValue || 1.4
  const doorU = materialsData.door.uValue || 1.1

  // Overall thermal conductance UA (W/K)
  const uaEnvelope =
    wallU * areas.wallArea +
    roofU * areas.roofArea +
    floorU * areas.floorArea +
    windowU * areas.windowArea +
    doorU * areas.doorArea

  // Infiltration at high altitude (air changes per hour)
  // Wind-driven infiltration adjusted for alpine air density
  const ach = 0.25 + Math.min(1.2, windSpeed * 0.08)
  const mDotCp = (ach / 3600) * areas.volume * ALTITUDE_AIR_DENSITY * AIR_SPECIFIC_HEAT
  const uaTotal = uaEnvelope + mDotCp

  // Heat loss rate Q = UA * ΔT (evaluated relative to comfort setpoint 21°C)
  const deltaT = Math.max(COMFORT_SETPOINT - ambientTemperature, 1)
  const conductionWall = wallU * areas.wallArea * deltaT
  const conductionRoof = roofU * areas.roofArea * deltaT
  const conductionFloor = floorU * areas.floorArea * deltaT
  const conductionWindow = windowU * areas.windowArea * deltaT
  const conductionDoor = doorU * areas.doorArea * deltaT
  const infiltrationLoss = mDotCp * deltaT
  const totalHeatLoss = conductionWall + conductionRoof + conductionFloor + conductionWindow + conductionDoor + infiltrationLoss

  // Solar heat capture
  const facingExposure = orientationFactor(orientation, timeOfDay)
  const dayClarity = Math.max(0.1, Math.min(1.0, sunshineHours / 9.5))
  
  // Direct window solar gain: Q = I * Area * SHGC * OrientationFactor
  const windowShgc = materialsData.glazing.shgc || 0.65
  const solarWindowGain = solarIrradiance * areas.windowArea * windowShgc * facingExposure * dayClarity

  // Opaque envelope Sol-Air absorption: absorptivity * Area * Irradiance * (U / h_exterior)
  const wallSolAir = solarIrradiance * (areas.wallArea * wall.absorptivity) * (wallU / 20) * facingExposure * dayClarity
  const roofSolAir = solarIrradiance * (areas.roofArea * roof.absorptivity) * (roofU / 20) * 0.85 * dayClarity
  const rawSolarGain = solarWindowGain + wallSolAir + roofSolAir
  const solarGainCap = Math.max(uaTotal * 28, 600)
  const solarGain = Math.min(rawSolarGain, solarGainCap)

  // Internal metabolic & appliance heat gain
  const internalHeatGain = occupancy * 80 + 150 // occupants + lighting/electronics

  // Thermal Mass flywheel calculation (Joules/K)
  const wallMass = areas.wallArea * wall.thickness * wall.density * wall.specificHeat
  const roofMass = areas.roofArea * roof.thickness * roof.density * roof.specificHeat
  const storageThickness = thermalMassThickness || thermalMassMaterial.thickness || 0
  const storageArea = Math.max(0, thermalMassArea || 0)
  const sensibleStorage =
    storageArea * storageThickness * thermalMassMaterial.density * thermalMassMaterial.specificHeat
  const latentStorage =
    storageArea * storageThickness * thermalMassMaterial.density * (thermalMassMaterial.latentHeat || 0)
  const totalThermalMass = wallMass + roofMass + sensibleStorage

  const storageEfficiency = thermalMassMaterial.storageEfficiency || 0
  const storageAbsorptivity = thermalMassMaterial.solarAbsorptivity || 0
  const dailyStorageInput = solarIrradiance * storageArea * storageAbsorptivity * storageEfficiency * sunshineHours * 3600
  const sensibleLimit = sensibleStorage * 8
  const storedThermalEnergyJ = Math.min(dailyStorageInput + latentStorage, sensibleLimit + latentStorage)
  const storedThermalEnergyKwh = storedThermalEnergyJ / 3600000
  const nightReleaseHours = Math.max(4, Math.min(16, analysisHours || 12))
  const massReleaseGain = timeOfDay < 6 || timeOfDay > 18
    ? (storedThermalEnergyJ * 0.62) / (nightReleaseHours * 3600)
    : (storedThermalEnergyJ * 0.10) / Math.max(1, sunshineHours * 3600)

  // Passive equilibrium indoor temperature
  // T_in = T_amb + (Q_solar + Q_internal) / UA_total
  const tempRise = (solarGain + internalHeatGain + massReleaseGain) / Math.max(uaTotal, 8)
  const indoorTemperature = ambientTemperature + tempRise
  const heatLossEnergyKwh = (totalHeatLoss * Math.max(1, analysisHours || 1)) / 1000
  const netPassiveEnergyKwh =
    ((solarGain + internalHeatGain + massReleaseGain - totalHeatLoss) * Math.max(1, analysisHours || 1)) / 1000
  const storageTemperatureLift = massReleaseGain / Math.max(uaTotal, 8)

  // Thermal efficiency metric (%)
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
    storedThermalEnergy: Number(storedThermalEnergyKwh.toFixed(2)),
    heatLossEnergy: Number(heatLossEnergyKwh.toFixed(2)),
    netPassiveEnergy: Number(netPassiveEnergyKwh.toFixed(2)),
    storageTemperatureLift: Number(storageTemperatureLift.toFixed(1)),
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
    materials: { wall, roof, insulation: insulationLayer, thermalMass: thermalMassMaterial },
    thermalMass: Math.round(totalThermalMass / 1000), // kJ/K
    inComfortBand,
  }
}

export function hourlyProfile(inputs) {
  return Array.from({ length: 24 }, (_, hour) => {
    // Diurnal solar irradiance curve (peaks at noon 12:00)
    const sunCurve = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
    // High-altitude diurnal temperature swing (~12°C daily variation in Ladakh)
    const ambientSwing = inputs.ambientTemperature + 6.5 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)
    
    const result = computeThermal({
      ...inputs,
      timeOfDay: hour,
      solarIrradiance: inputs.solarIrradiance * sunCurve,
      sunshineHours: sunCurve > 0 ? inputs.sunshineHours : 0,
      ambientTemperature: ambientSwing,
    })

    // Simulated unheated uninsulated shelter baseline for comparison
    const uninsulatedIndoor = ambientSwing + (sunCurve * 2.5)

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      indoor: Number(result.indoorTemperature.toFixed(1)),
      outdoor: Number(ambientSwing.toFixed(1)),
      unheated: Number(uninsulatedIndoor.toFixed(1)),
      heatLoss: Number((result.heatLoss / 1000).toFixed(2)),
      solarGain: Number((result.solarGain / 1000).toFixed(2)),
      comfortMin: TARGET_MIN,
      comfortMax: TARGET_MAX,
    }
  })
}

export function heatLossByMaterial(baseInputs) {
  return materialsData.walls.map((wall) => {
    const result = computeThermal({ ...baseInputs, wallMaterialId: wall.id })
    return {
      name: wall.name,
      heatLoss: Number((result.heatLoss / 1000).toFixed(2)),
      indoor: result.indoorTemperature,
      rValue: wall.rValue || Number((wall.thickness / wall.conductivity).toFixed(2)),
    }
  })
}

export function efficiencyByShape(baseInputs) {
  const shapes = ['rectangular', 'dome', 'a-frame', 'semi-cylindrical']
  return shapes.map((shape) => {
    const result = computeThermal({ ...baseInputs, shape })
    return {
      name: shapeLabel(shape),
      shape,
      efficiency: result.thermalEfficiency,
      indoor: result.indoorTemperature,
      heatLoss: Number((result.heatLoss / 1000).toFixed(2)),
      solarGain: Number((result.solarGain / 1000).toFixed(2)),
    }
  })
}

export function shapeLabel(shape) {
  return {
    rectangular: 'Rectangular',
    dome: 'Geodesic Dome',
    'a-frame': 'A-Frame',
    'semi-cylindrical': 'Semi-Cylindrical',
  }[shape] || shape
}
