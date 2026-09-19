import { useSimulator } from '../context/SimulatorContext'

export function useSimulatorState() {
  return useSimulator()
}
