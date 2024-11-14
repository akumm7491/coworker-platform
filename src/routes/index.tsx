import { Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Agents from '@/pages/Agents'
import Projects from '@/pages/Projects'
import Analytics from '@/pages/Analytics'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  )
}

export default AppRoutes
