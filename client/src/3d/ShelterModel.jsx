import { useShelterMaterials } from './ThermalMaterial'
import { useProceduralTextures } from './textures'
import RectangularShelter from './shapes/Rectangular'
import DomeShelter from './shapes/Dome'
import AFrameShelter from './shapes/AFrame'
import SemiCylindricalShelter from './shapes/SemiCylindrical'

export default function ShelterModel({ inputs, thermal, thermalView, wireframe = false }) {
  const textures = useProceduralTextures()
  const materials = useShelterMaterials({
    thermalView,
    thermal,
    wallColor: thermal?.materials?.wall?.color || '#64748B',
    roofColor: thermal?.materials?.roof?.color || '#475569',
    textures,
    wireframe,
  })

  const common = { inputs, materials, thermalView, wireframe }

  switch (inputs.shape) {
    case 'dome':
      return <DomeShelter {...common} />
    case 'a-frame':
      return <AFrameShelter {...common} />
    case 'semi-cylindrical':
      return <SemiCylindricalShelter {...common} />
    case 'rectangular':
    default:
      return <RectangularShelter {...common} />
  }
}
