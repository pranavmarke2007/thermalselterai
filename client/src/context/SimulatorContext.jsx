import { createContext, useContext, useMemo, useState } from 'react'
import { defaultSimulatorState } from '../data/dummy'
import { computeThermal, efficiencyByShape, heatLossByMaterial, hourlyProfile } from '../calculations/thermal'
import { generateRecommendations } from '../calculations/recommend'

const SimulatorContext = createContext(null)

export function SimulatorProvider({ children }) {
  const [inputs, setInputs] = useState(defaultSimulatorState)
  const [hasUserInput, setHasUserInput] = useState(false)
  const [thermalView, setThermalView] = useState(false)
  const [compareSet, setCompareSet] = useState([])

  const update = (patch) => {
    setHasUserInput(true)
    setInputs((prev) => ({ ...prev, ...patch }))
  }

  const thermal = useMemo(() => computeThermal(inputs), [inputs])
  const hourly = useMemo(() => hourlyProfile(inputs), [inputs])
  const materialLoss = useMemo(() => heatLossByMaterial(inputs), [inputs])
  const shapeEfficiency = useMemo(() => efficiencyByShape(inputs), [inputs])
  const recommendations = useMemo(() => generateRecommendations(inputs, 8), [inputs])

  const applyDesign = (design) => {
    update({
      shape: design.shape,
      orientation: design.orientation,
      wallMaterialId: design.wallId,
      roofMaterialId: design.roofId,
      insulationId: design.insulationId,
      insulationThickness: design.insulationThickness,
      thermalMassId: design.thermalMassId,
      thermalMassArea: design.thermalMassArea,
      thermalMassThickness: design.thermalMassThickness,
    })
  }

  const addComparison = (design) => {
    setCompareSet((prev) => {
      const next = [...prev, { ...design, id: `${design.shape}-${Date.now()}` }]
      return next.slice(-4)
    })
  }

  const value = {
    inputs,
    update,
    hasUserInput,
    thermal,
    hourly,
    materialLoss,
    shapeEfficiency,
    recommendations,
    thermalView,
    setThermalView,
    applyDesign,
    compareSet,
    addComparison,
    setCompareSet,
  }

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext)
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider')
  return ctx
}
