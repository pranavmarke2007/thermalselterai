const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }
  return response.json()
}

export function fetchMaterials() {
  return request('/materials')
}

export function runSimulation(payload) {
  return request('/simulate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchRecommendations(payload) {
  return request('/recommend', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchWeather(lat = 34.1526, lon = 77.5771) {
  return request(`/weather?lat=${lat}&lon=${lon}`)
}

export function saveSimulation(payload) {
  return request('/simulations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listSimulations() {
  return request('/simulations')
}
