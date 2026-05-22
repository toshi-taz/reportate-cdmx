import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const SEVERITY_COLOR = {
  critical: '#ff453a',
  high: '#ff9f0a',
  medium: '#ffd60a',
  low: '#30d158',
}

const CATEGORY_LABEL = {
  bache: 'Bache',
  alumbrado: 'Alumbrado',
  basura: 'Basura',
  graffiti: 'Graffiti',
  inundacion: 'Inundación',
  obra_abandonada: 'Obra abandonada',
}

const CATEGORY_ICON = {
  bache: '🕳️',
  alumbrado: '💡',
  basura: '🗑️',
  graffiti: '🎨',
  inundacion: '🌊',
  obra_abandonada: '🚧',
}

function calcStats(reports) {
  const byCat = {}
  const bySev = { critical: 0, high: 0, medium: 0, low: 0 }
  const byAuth = {}

  for (const r of reports) {
    if (r.category) byCat[r.category] = (byCat[r.category] ?? 0) + 1
    if (r.severity && r.severity in bySev) bySev[r.severity]++
    if (r.authority) byAuth[r.authority] = (byAuth[r.authority] ?? 0) + 1
  }

  const topAuthorities = Object.entries(byAuth)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return { byCat, bySev, topAuthorities }
}

export default function StatsView() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/reports`)
      .then((r) => r.json())
      .then((data) => { setReports(data); setLoading(false) })
      .catch(() => { setError('No se pudieron cargar los datos'); setLoading(false) })
  }, [])

  if (loading) return <div style={s.center}><span style={s.muted}>Cargando...</span></div>
  if (error) return <div style={s.center}><span style={s.errorText}>{error}</span></div>

  const { byCat, bySev, topAuthorities } = calcStats(reports)
  const maxCat = Math.max(...Object.values(byCat), 1)

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.headerTitle}>Estadísticas</span>
        <span style={s.headerSub}>Ciudad de México</span>
      </div>

      {/* Total */}
      <div style={s.totalCard}>
        <span style={s.totalNumber}>{reports.length}</span>
        <span style={s.totalLabel}>Reportes totales</span>
      </div>

      {/* Severity */}
      <div style={s.section}>
        <span style={s.sectionTitle}>Por severidad</span>
        <div style={s.card}>
          <div style={s.sevRow}>
            {Object.entries(bySev).map(([sev, count]) => (
              <div key={sev} style={s.sevItem}>
                <span style={{ ...s.sevBadge, background: SEVERITY_COLOR[sev] + '22', color: SEVERITY_COLOR[sev], borderColor: SEVERITY_COLOR[sev] + '55' }}>
                  {sev === 'critical' ? 'Crítico' : sev === 'high' ? 'Alto' : sev === 'medium' ? 'Medio' : 'Bajo'}
                </span>
                <span style={{ ...s.sevCount, color: SEVERITY_COLOR[sev] }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={s.section}>
        <span style={s.sectionTitle}>Por categoría</span>
        <div style={s.card}>
          {Object.keys(CATEGORY_LABEL).map((cat) => {
            const count = byCat[cat] ?? 0
            const pct = Math.round((count / maxCat) * 100)
            return (
              <div key={cat} style={s.catRow}>
                <span style={s.catIcon}>{CATEGORY_ICON[cat]}</span>
                <div style={s.catInfo}>
                  <div style={s.catMeta}>
                    <span style={s.catName}>{CATEGORY_LABEL[cat]}</span>
                    <span style={s.catCount}>{count}</span>
                  </div>
                  <div style={s.barTrack}>
                    <div style={{ ...s.barFill, width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top authorities */}
      <div style={s.section}>
        <span style={s.sectionTitle}>Autoridades con más reportes</span>
        <div style={s.card}>
          {topAuthorities.length === 0
            ? <span style={s.muted}>Sin datos</span>
            : topAuthorities.map(([auth, count], i) => (
              <div key={auth} style={{ ...s.authRow, borderBottom: i < topAuthorities.length - 1 ? '1px solid #2c2c2e' : 'none' }}>
                <span style={{ ...s.authRank, color: i === 0 ? '#ffd60a' : i === 1 ? '#d1d1d6' : '#a2845e' }}>
                  #{i + 1}
                </span>
                <span style={s.authName}>{auth}</span>
                <span style={s.authCount}>{count}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}

const s = {
  page: {
    minHeight: '100%',
    background: '#000',
    padding: '0 16px',
    paddingBottom: 16,
  },
  center: {
    height: 'calc(100dvh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#636366',
  },
  totalCard: {
    background: '#1c1c1e',
    borderRadius: 16,
    padding: '20px 20px',
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  totalNumber: {
    fontSize: 52,
    fontWeight: 700,
    color: '#ff453a',
    lineHeight: 1,
    letterSpacing: -1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  card: {
    background: '#1c1c1e',
    borderRadius: 16,
    padding: '4px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  sevRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px 0',
    gap: 8,
  },
  sevItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sevBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 20,
    border: '1px solid',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  sevCount: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
  },
  catRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #2c2c2e',
  },
  catIcon: {
    fontSize: 20,
    flexShrink: 0,
    width: 28,
    textAlign: 'center',
  },
  catInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  catMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  catName: {
    fontSize: 14,
    color: '#d1d1d6',
  },
  catCount: {
    fontSize: 13,
    fontWeight: 600,
    color: '#8e8e93',
  },
  barTrack: {
    height: 4,
    background: '#3a3a3c',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: '#ff453a',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  authRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    paddingBottom: 14,
  },
  authRank: {
    fontSize: 15,
    fontWeight: 700,
    width: 28,
    flexShrink: 0,
  },
  authName: {
    flex: 1,
    fontSize: 14,
    color: '#d1d1d6',
  },
  authCount: {
    fontSize: 14,
    fontWeight: 600,
    color: '#8e8e93',
  },
  muted: {
    color: '#636366',
    fontSize: 14,
  },
  errorText: {
    color: '#ff453a',
    fontSize: 14,
  },
}
