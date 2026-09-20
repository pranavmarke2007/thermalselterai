export const defaultSimulatorState = {
  ambientTemperature: -8,
  solarIrradiance: 720,
  windSpeed: 4.2,
  humidity: 28,
  sunshineHours: 8.5,
  timeOfDay: 0,
  length: 8,
  width: 6,
  height: 3.2,
  shape: 'rectangular',
  orientation: 170,
  windowCount: 4,
  windowWidth: 1.2,
  windowHeight: 1.1,
  doorWidth: 1,
  doorHeight: 2.1,
  wallMaterialId: 'insulated-panel',
  roofMaterialId: 'insulated-roof',
  insulationId: 'xps',
  insulationThickness: 0.08,
  thermalMassId: 'stone-slab',
  thermalMassArea: 12,
  thermalMassThickness: 0.08,
  analysisHours: 12,
  occupancy: 4,
  location: 'Leh, Ladakh',
  weatherMode: 'manual',
}

export const ladakhClimateNotes = [
  {
    title: 'High-altitude desert',
    text: 'Leh sits near 3,500 m. Winter nights drop below -15°C while midday solar irradiance remains unusually high.',
  },
  {
    title: 'Passive solar opportunity',
    text: 'South-facing glazing and compact envelopes can offset envelope losses without active heating for much of the day.',
  },
  {
    title: 'Wind and infiltration',
    text: 'Valley winds raise air-change rates. Air-tight doors and vestibules matter as much as insulation thickness.',
  },
]
