# ThermoShelter AI

Passive shelter design and thermal simulation platform for cold regions such as Ladakh. Built for Smart India Hackathon.

## Stack

- Frontend: React + Vite + Tailwind CSS
- 3D: Three.js, React Three Fiber, Drei
- Charts: Recharts
- Motion: Framer Motion
- Backend: Node.js + Express
- Database: MongoDB (optional; in-memory fallback)

## Install

From the project root:

```bash
npm install
npm run install:all
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000/api/health

Optional MongoDB: copy `server/.env.example` to `server/.env` and set `MONGO_URI`.

## Features

- Climate and shelter geometry inputs
- Material library with conductivity, density, specific heat, and thickness
- Heat loss, solar gain, indoor temperature, and efficiency engine
- Combinatorial recommendation search targeting 18–24°C
- Interactive 3D shelters (rectangular, dome, A-frame, semi-cylindrical)
- Normal / thermal heatmap views
- Open-Meteo weather proxy with Leh fallback
