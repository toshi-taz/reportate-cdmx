import { useState } from 'react'
import UploadView from './components/UploadView'
import MapView from './components/MapView'
import StatsView from './components/StatsView'
import './App.css'

const TABS = [
  { value: 'report', icon: '📷', label: 'Reportar' },
  { value: 'map',    icon: '🗺️', label: 'Mapa' },
  { value: 'stats',  icon: '📊', label: 'Stats' },
]

export default function App() {
  const [tab, setTab] = useState('report')

  return (
    <div className="app">
      <div className="view">
        {tab === 'report' && <UploadView />}
        {tab === 'map'    && <MapView />}
        {tab === 'stats'  && <StatsView />}
      </div>
      <nav className="tabs">
        {TABS.map(({ value, icon, label }) => (
          <button
            key={value}
            className={`tab-btn ${tab === value ? 'active' : ''}`}
            onClick={() => setTab(value)}
          >
            <span className="tab-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
