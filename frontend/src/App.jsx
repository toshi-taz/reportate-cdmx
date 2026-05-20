import { useState } from 'react'
import UploadView from './components/UploadView'
import MapView from './components/MapView'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('report')

  return (
    <div className="app">
      <div className="view">
        {tab === 'report' ? <UploadView /> : <MapView />}
      </div>
      <nav className="tabs">
        <button
          className={`tab-btn ${tab === 'report' ? 'active' : ''}`}
          onClick={() => setTab('report')}
        >
          <span className="tab-icon">📷</span>
          Reportar
        </button>
        <button
          className={`tab-btn ${tab === 'map' ? 'active' : ''}`}
          onClick={() => setTab('map')}
        >
          <span className="tab-icon">🗺️</span>
          Mapa
        </button>
      </nav>
    </div>
  )
}
