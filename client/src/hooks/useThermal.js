import { useSimulator } from '../context/SimulatorContext'

export function useThermal() {
  const { thermal, hourly, materialLoss, shapeEfficiency } = useSimulator()
  return { thermal, hourly, materialLoss, shapeEfficiency }
}
