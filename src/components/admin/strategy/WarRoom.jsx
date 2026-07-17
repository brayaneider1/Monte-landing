import React from 'react'

const BRAYAN_COLOR = '#38BDF8'
const MARIA_COLOR  = '#F472B6'
const GOLD = '#F59E0B'
const GREEN = '#00FF88'
const RED = '#EF4444'

const formatCOP = (val) => {
  if (!val) return '$0'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

export default function WarRoom({ phaseStats, crewStats, sponsorStats, strategy }) {
  const totalTasks = phaseStats.reduce((s, p) => s + p.total, 0)
  const completedTasks = phaseStats.reduce((s, p) => s + p.completadas, 0)
  const inProgressTasks = phaseStats.reduce((s, p) => s + p.en_progreso, 0)
  const blockedTasks = phaseStats.reduce((s, p) => s + p.bloqueadas, 0)
  const globalPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const statusColor = { pendiente: '#9CA3AF', en_progreso: GOLD, publicado: GREEN, bloqueado: RED }

  return (
    <div>
      {/* Header Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(244,114,182,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '20px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
      }}>
        <img src="/selvatica_monochrome.png" alt="Selvática" style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.4))' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '2px' }}>Loop.rave · Marketing War Room</div>
          <h2 style={{ margin: '4px 0', fontSize: '1.4rem' }}>{strategy?.title || 'SELVÁTICA'}</h2>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{strategy?.timeline}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: `rgba(56,189,248,0.15)`, border: `1px solid ${BRAYAN_COLOR}`, borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: BRAYAN_COLOR, textTransform: 'uppercase' }}>Brayan</div>
            <div style={{ fontSize: '11px', color: 'white', marginTop: '2px' }}>Diseño · Edición · DJ</div>
          </div>
          <div style={{ background: `rgba(244,114,182,0.15)`, border: `1px solid ${MARIA_COLOR}`, borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: MARIA_COLOR, textTransform: 'uppercase' }}>María</div>
            <div style={{ fontSize: '11px', color: 'white', marginTop: '2px' }}>Community · Grab. · DJ</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <KpiCard label="Progreso Global" value={`${globalPct}%`} sub={`${completedTasks}/${totalTasks} tareas`} color={GREEN} />
        <KpiCard label="En Progreso" value={inProgressTasks} sub="tareas activas" color={GOLD} />
        <KpiCard label="Bloqueadas" value={blockedTasks} sub="necesitan atención" color={RED} />
        <KpiCard label="EMV Total" value={formatCOP(crewStats.totalEmv)} sub="alcance orgánico" color={BRAYAN_COLOR} />
        <KpiCard label="Posts Red" value={`${crewStats.totalPosts}/${crewStats.totalPlaneados}`} sub="publicados" color={MARIA_COLOR} />
        <KpiCard label="Boletas Red" value={crewStats.totalBoletas} sub="atribuidas a la red" color={GOLD} />
      </div>

      {/* Phase Progress Bars */}
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Progreso por Fase</div>
        {phaseStats.map(fase => (
          <div key={fase.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'white' }}>{fase.nombre}</span>
              <span style={{ fontSize: '11px', color: fase.pct === 100 ? GREEN : '#9CA3AF' }}>{fase.completadas}/{fase.total} · {fase.pct}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${fase.pct}%`,
                background: fase.pct === 100 ? GREEN : `linear-gradient(90deg, ${BRAYAN_COLOR}, ${MARIA_COLOR})`,
                borderRadius: '3px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Sponsor Alerts */}
      {sponsorStats.vencidos.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ color: RED, fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>⚠️ SEGUIMIENTOS VENCIDOS — {sponsorStats.vencidos.length} sponsors</div>
          {sponsorStats.vencidos.map(sp => (
            <div key={sp.id} style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
              · <strong style={{ color: 'white' }}>{sp.nombre}</strong> · Responsable: <span style={{ color: sp.gestionado_por === 'brayan' ? BRAYAN_COLOR : MARIA_COLOR }}>{sp.gestionado_por}</span> · Vencía: {sp.proximo_seguimiento}
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
        {Object.entries(sponsorStats.byStage).map(([etapa, items]) => (
          <div key={etapa} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: items.length > 0 ? GREEN : '#9CA3AF' }}>{items.length}</div>
            <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', marginTop: '2px' }}>{etapa.replace('_', ' ')}</div>
          </div>
        ))}
        <div style={{ background: 'rgba(0,255,136,0.05)', border: `1px solid rgba(0,255,136,0.2)`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: GREEN }}>{formatCOP(sponsorStats.valorTotal)}</div>
          <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', marginTop: '2px' }}>Sponsors cerrados</div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: `rgba(${hexToRgb(color)},0.07)`, border: `1px solid rgba(${hexToRgb(color)},0.25)`, borderRadius: '10px', padding: '14px' }}>
      <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color, marginTop: '4px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>{sub}</div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
