import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const Simulator = lazy(() => import('./pages/Simulator'))
const MaterialLibrary = lazy(() => import('./pages/MaterialLibrary'))
const Viewer3D = lazy(() => import('./pages/Viewer3D'))
const Comparison = lazy(() => import('./pages/Comparison'))
const About = lazy(() => import('./pages/About'))

function ScreenLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#00D4FF]">
      Loading module…
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<ScreenLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/materials" element={<MaterialLibrary />} />
          <Route path="/viewer" element={<Viewer3D />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
