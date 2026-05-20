import { useState, useRef } from 'react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const SEVERITY_COLOR = {
  critical: '#ff453a',
  high: '#ff9f0a',
  medium: '#ffd60a',
  low: '#30d158',
}

export default function UploadView() {
  const [preview, setPreview] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  function handleFile(file) {
    if (!file) return
    setResult(null)
    setError(null)
    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setImageData(e.target.result)
    }
    reader.readAsDataURL(file)

    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation(null)
    )
  }

  async function handleAnalyze() {
    if (!imageData) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          media_type: mediaType,
          lat: location?.lat ?? null,
          lng: location?.lng ?? null,
        }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setResult(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setPreview(null)
    setImageData(null)
    setMediaType(null)
    setLocation(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reporta un problema</h1>

      {!preview ? (
        <label style={styles.cameraBtn}>
          <span style={styles.cameraIcon}>📷</span>
          <span>Tomar foto</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <img src={preview} alt="preview" style={styles.preview} />
      )}

      {preview && !result && (
        <div style={styles.actions}>
          {location && (
            <p style={styles.gps}>
              GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
          <button style={styles.analyzeBtn} onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analizando...' : 'Analizar con IA'}
          </button>
          <button style={styles.resetBtn} onClick={handleReset}>Cancelar</button>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={{ ...styles.card, borderColor: SEVERITY_COLOR[result.severity] ?? '#555' }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.badge, background: SEVERITY_COLOR[result.severity] ?? '#555' }}>
              {result.severity?.toUpperCase()}
            </span>
            <span style={styles.category}>{result.category}</span>
          </div>
          <p style={styles.desc}>{result.description}</p>
          <p style={styles.field}><strong>Solución:</strong> {result.solution}</p>
          <p style={styles.field}><strong>Autoridad:</strong> {result.authority}</p>
          <p style={styles.field}><strong>Impacto:</strong> {result.impact_score}/10</p>
          {result.hashtags?.length > 0 && (
            <p style={styles.hashtags}>{result.hashtags.join(' ')}</p>
          )}
          <button style={styles.resetBtn} onClick={handleReset}>Nuevo reporte</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    minHeight: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    alignSelf: 'flex-start',
  },
  cameraBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    height: 220,
    border: '2px dashed #3a3a3c',
    borderRadius: 16,
    cursor: 'pointer',
    fontSize: 15,
    color: '#8e8e93',
  },
  cameraIcon: {
    fontSize: 48,
  },
  preview: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'cover',
    borderRadius: 12,
  },
  actions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  gps: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  analyzeBtn: {
    width: '100%',
    padding: '14px',
    background: '#ff453a',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    padding: '12px',
    background: '#2c2c2e',
    color: '#f2f2f7',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    cursor: 'pointer',
  },
  error: {
    color: '#ff453a',
    fontSize: 14,
  },
  card: {
    width: '100%',
    background: '#1c1c1e',
    borderRadius: 16,
    border: '1.5px solid',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: '#000',
  },
  category: {
    fontSize: 15,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  desc: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#d1d1d6',
  },
  field: {
    fontSize: 13,
    color: '#aeaeb2',
    lineHeight: 1.4,
  },
  hashtags: {
    fontSize: 12,
    color: '#636366',
  },
}
