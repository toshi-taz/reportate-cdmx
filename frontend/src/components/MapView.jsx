import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const SEVERITY_COLOR = {
  critical: '#ff453a',
  high: '#ff9f0a',
  medium: '#ffd60a',
  low: '#30d158',
}

const CDMX = [19.4326, -99.1332]

export default function MapView() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/reports`)
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setError('No se pudieron cargar los reportes'))
  }, [])

  return (
    <div style={{ height: 'calc(100dvh - 60px)', width: '100%', position: 'relative' }}>
      {error && <p style={styles.error}>{error}</p>}
      <MapContainer
        center={CDMX}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {reports.map((r) => (
          r.lat && r.lng ? (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lng]}
              radius={8}
              pathOptions={{
                color: SEVERITY_COLOR[r.severity] ?? '#888',
                fillColor: SEVERITY_COLOR[r.severity] ?? '#888',
                fillOpacity: 0.85,
                weight: 1.5,
              }}
            >
              <Popup>
                <div style={styles.popup}>
                  <strong style={{ textTransform: 'capitalize' }}>{r.category}</strong>
                  <span style={{ color: SEVERITY_COLOR[r.severity] ?? '#888', fontSize: 12 }}>
                    {r.severity}
                  </span>
                  <p>{r.description}</p>
                  <p style={styles.authority}>{r.authority}</p>
                </div>
              </Popup>
            </CircleMarker>
          ) : null
        ))}
      </MapContainer>

      <div style={styles.legend}>
        {Object.entries(SEVERITY_COLOR).map(([sev, color]) => (
          <span key={sev} style={styles.legendItem}>
            <span style={{ ...styles.dot, background: color }} />
            {sev}
          </span>
        ))}
      </div>
    </div>
  )
}

const styles = {
  error: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: '#1c1c1e',
    padding: '8px 16px',
    borderRadius: 20,
    fontSize: 13,
    color: '#ff453a',
  },
  popup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 13,
    minWidth: 160,
  },
  authority: {
    fontSize: 11,
    color: '#636366',
    marginTop: 2,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    zIndex: 1000,
    background: 'rgba(15,15,15,0.85)',
    backdropFilter: 'blur(6px)',
    borderRadius: 10,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#d1d1d6',
    textTransform: 'capitalize',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
}
