import { useCallback, useState } from 'react'
import { fetchWeather } from './api'

export const LADAKH_REGIONS = [
  {
    id: 'leh',
    name: 'Leh (3,524 m)',
    lat: 34.1526,
    lon: 77.5771,
    altitude: '3,524 m',
    winterAvg: -10.2,
    solarAvg: 720,
    windAvg: 4.2,
    desc: 'Capital of Ladakh. Severe winter nights with strong solar irradiance during daytime.',
  },
  {
    id: 'dras',
    name: 'Dras (3,280 m)',
    lat: 34.4292,
    lon: 75.7601,
    altitude: '3,280 m',
    winterAvg: -22.5,
    solarAvg: 580,
    windAvg: 6.8,
    desc: 'Gateway to Ladakh — 2nd coldest inhabited place on Earth. Freezing blizzards and extreme envelope heat losses.',
  },
  {
    id: 'kargil',
    name: 'Kargil (2,676 m)',
    lat: 34.5539,
    lon: 76.1310,
    altitude: '2,676 m',
    winterAvg: -8.5,
    solarAvg: 680,
    windAvg: 3.6,
    desc: 'Suru river valley floor. High temperature swings with heavy winter snowfall.',
  },
  {
    id: 'nyoma',
    name: 'Nyoma / Changthang (4,180 m)',
    lat: 33.1969,
    lon: 78.6508,
    altitude: '4,180 m',
    winterAvg: -18.0,
    solarAvg: 850,
    windAvg: 7.2,
    desc: 'High-altitude Changthang plateau. Thin air, intense solar UV radiation, and freezing desert winds.',
  },
  {
    id: 'nubra',
    name: 'Nubra Valley / Diskit (3,048 m)',
    lat: 34.5428,
    lon: 77.5583,
    altitude: '3,048 m',
    winterAvg: -7.2,
    solarAvg: 740,
    windAvg: 4.0,
    desc: 'Tri-armed valley north of Khardung La. High winter sunshine hours and moderate shelter microclimates.',
  },
]

export function useWeather() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [snapshot, setSnapshot] = useState(null)

  const load = useCallback(async (region = LADAKH_REGIONS[0]) => {
    setStatus('loading')
    setError('')
    try {
      // First try backend API proxy, or direct open-meteo if backend is cold
      let data
      try {
        data = await fetchWeather(region.lat, region.lon)
      } catch {
        // Direct client fallback to Open-Meteo
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation&daily=sunshine_duration&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Live weather service unreachable')
        const json = await res.json()
        const current = json.current || {}
        const sunshineSec = json.daily?.sunshine_duration?.[0] || 8.5 * 3600
        data = {
          location: region.name,
          ambientTemperature: current.temperature_2m ?? region.winterAvg,
          solarIrradiance: current.shortwave_radiation ?? region.solarAvg,
          windSpeed: current.wind_speed_10m ?? region.windAvg,
          humidity: current.relative_humidity_2m ?? 28,
          sunshineHours: Number((sunshineSec / 3600).toFixed(1)),
          source: 'open-meteo-direct',
        }
      }

      setSnapshot(data)
      setStatus('ready')
      return data
    } catch {
      // Scientific climatological fallback for the selected region
      const fallback = {
        location: region.name,
        ambientTemperature: region.winterAvg,
        solarIrradiance: region.solarAvg,
        windSpeed: region.windAvg,
        humidity: 28,
        sunshineHours: 8.5,
        source: 'regional-climatology',
        note: `Loaded official meteorological baseline for ${region.name}.`,
      }
      setSnapshot(fallback)
      setStatus('fallback')
      setError(fallback.note)
      return fallback
    }
  }, [])

  return { status, error, snapshot, load, regions: LADAKH_REGIONS }
}
