import mongoose from 'mongoose'

const SimulationSchema = new mongoose.Schema(
  {
    location: String,
    inputs: { type: Object, required: true },
    results: { type: Object, required: true },
  },
  { timestamps: true },
)

export const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema)
