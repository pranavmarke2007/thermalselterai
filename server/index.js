import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { computeThermal, materialsData } from './calculations/thermal.js'
import { generateRecommendations } from './calculations/recommend.js'
import { Simulation } from './models/Simulation.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const memoryStore = []
let mongoReady = false

app.use(cors())
app.use(express.json({ limit: '1mb' }))

async function connectMongo() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.log('MONGO_URI not set — using in-memory simulation store')
    return
  }
  try {
    await mongoose.connect(uri)
    mongoReady = true
    console.log('Connected to MongoDB')
  } catch (error) {
    console.log('MongoDB unavailable, falling back to memory store:', error.message)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ThermoShelter AI', mongo: mongoReady })
})

app.get('/api/materials', (_req, res) => {
  res.json(materialsData)
})

app.post('/api/simulate', (req, res) => {
  const results = computeThermal(req.body || {})
  res.json(results)
})

app.post('/api/recommend', (req, res) => {
  const payload = generateRecommendations(req.body || {}, 8)
  res.json(payload)
})

app.get('/api/weather', async (req, res) => {
  const lat = Number(req.query.lat || 34.1526)
  const lon = Number(req.query.lon || 77.5771)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation&daily=sunshine_duration&timezone=auto`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Weather provider error')
    const data = await response.json()
    const current = data.current || {}
    const sunshineSeconds = data.daily?.sunshine_duration?.[0] || 8.2 * 3600
    res.json({
      location: lat === 34.1526 ? 'Leh, Ladakh' : `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      ambientTemperature: current.temperature_2m ?? -8,
      solarIrradiance: current.shortwave_radiation ?? 620,
      windSpeed: current.wind_speed_10m ?? 4,
      humidity: current.relative_humidity_2m ?? 30,
      sunshineHours: Number((sunshineSeconds / 3600).toFixed(1)),
      source: 'open-meteo',
    })
  } catch (error) {
    res.json({
      location: 'Leh, Ladakh',
      ambientTemperature: -9.4,
      solarIrradiance: 640,
      windSpeed: 3.8,
      humidity: 31,
      sunshineHours: 8.1,
      source: 'fallback',
      note: error.message,
    })
  }
})

app.get('/api/simulations', async (_req, res) => {
  if (mongoReady) {
    const rows = await Simulation.find().sort({ createdAt: -1 }).limit(25)
    return res.json(rows)
  }
  res.json(memoryStore.slice(-25).reverse())
})

app.post('/api/simulations', async (req, res) => {
  const record = {
    location: req.body.location || 'Leh, Ladakh',
    inputs: req.body.inputs || req.body,
    results: req.body.results || computeThermal(req.body.inputs || req.body),
    createdAt: new Date(),
  }
  if (mongoReady) {
    const saved = await Simulation.create(record)
    return res.status(201).json(saved)
  }
  record.id = `mem-${Date.now()}`
  memoryStore.push(record)
  res.status(201).json(record)
})

app.get('/api/schema/material', (_req, res) => {
  const sample = JSON.parse(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'data/materials.json'), 'utf8'),
  )
  res.json({
    fields: ['name', 'conductivity', 'density', 'specificHeat', 'thickness'],
    sample: sample.walls[0],
  })
})

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`ThermoShelter API listening on http://localhost:${PORT}`)
  })
})
