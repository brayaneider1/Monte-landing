import React, { useState } from 'react'
import { useStrategyStore } from '../../hooks/useStrategyStore'
import { useMarketingCrew } from '../../hooks/useMarketingCrew'
import { useSponsorPipeline } from '../../hooks/useSponsorPipeline'
import WarRoom from './strategy/WarRoom'
import ContentPlan from './strategy/ContentPlan'
import CrewManager from './strategy/CrewManager'
import SponsorPipeline from './strategy/SponsorPipeline'

const GREEN = '#00FF88'
const BRAYAN = '#38BDF8'
const MARIA  = '#F472B6'

const NAV = [
  { id: 'warroom',  label: '🎯 War Room'    },
  { id: 'plan',     label: '📅 Contenidos'  },
  { id: 'crew',     label: '🎤 Red'         },
  { id: 'sponsors', label: '🤝 Sponsors'    },
  { id: 'finanzas', label: '💰 Finanzas'    },
]

const formatCOP = (v) => {
  if (!v && v !== 0) return '—'
  if (typeof v === 'string' && v.includes('$')) return v
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

export default function StrategyDashboard() {
  const [subTab, setSubTab] = useState('warroom')

  const {
    strategy,
    updateField, updateKpi, updateTask, updateTaskMetrics,
    addTask, deleteTask, addListItem, updateListItem, deleteListItem,
    getPhaseStats, getTotalEmv, resetToDefaults
  } = useStrategyStore()

  const {
    crew, addPerson, updatePerson, deletePerson,
    addPost, updatePost, deletePost, getCrewStats
  } = useMarketingCrew()

  const {
    pipeline, addSponsor, updateSponsor, deleteSponsor,
    advanceStage, getPipelineStats
  } = useSponsorPipeline()

  const phaseStats   = getPhaseStats()
  const crewStats    = getCrewStats()
  const sponsorStats = getPipelineStats()

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* ── Top Nav ── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
        {NAV.map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{
            background: subTab === tab.id ? GREEN : 'rgba(255,255,255,0.05)',
            color: subTab === tab.id ? 'black' : '#9CA3AF',
            border: `1px solid ${subTab === tab.id ? GREEN : 'rgba(255,255,255,0.1)'}`,
            padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold',
            cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px', transition: 'all 0.2s'
          }}>
            {tab.label}
          </button>
        ))}
        <button onClick={() => { if (confirm('¿Restaurar datos originales? Se perderán los cambios.')) resetToDefaults() }}
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', marginLeft: 'auto' }}>
          ↺ Reset
        </button>
      </div>

      {/* ── War Room ── */}
      {subTab === 'warroom' && (
        <WarRoom
          phaseStats={phaseStats}
          crewStats={crewStats}
          sponsorStats={sponsorStats}
          strategy={strategy}
        />
      )}

      {/* ── Plan de Contenidos ── */}
      {subTab === 'plan' && (
        <ContentPlan
          strategy={strategy}
          updateTask={updateTask}
          updateTaskMetrics={updateTaskMetrics}
          addTask={addTask}
          deleteTask={deleteTask}
        />
      )}

      {/* ── Red de Activación ── */}
      {subTab === 'crew' && (
        <CrewManager
          crew={crew}
          addPerson={addPerson}
          updatePerson={updatePerson}
          deletePerson={deletePerson}
          addPost={addPost}
          updatePost={updatePost}
          deletePost={deletePost}
        />
      )}

      {/* ── Pipeline de Sponsors ── */}
      {subTab === 'sponsors' && (
        <SponsorPipeline
          pipeline={pipeline}
          addSponsor={addSponsor}
          updateSponsor={updateSponsor}
          deleteSponsor={deleteSponsor}
          advanceStage={advanceStage}
          getPipelineStats={getPipelineStats}
        />
      )}

      {/* ── Finanzas & Barra ── */}
      {subTab === 'finanzas' && (
        <FinanzasPanel strategy={strategy} formatCOP={formatCOP} />
      )}
    </div>
  )
}

// ─── Finanzas Panel (static read + editable KPIs) ───────────────────────────
function FinanzasPanel({ strategy, formatCOP }) {
  const data = strategy

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Resumen Total */}
      {data.resumen_total?.escenarios && (
        <Section title="GRAN RESUMEN CONSOLIDADO">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Th>Escenario</Th><Th>Evento</Th><Th>After</Th><Th>Total</Th><Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {data.resumen_total.escenarios.map((esc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Td>{esc.nombre}</Td>
                    <Td style={{ color: esc.ganancia_evento?.includes('-') ? '#EF4444' : '#00FF88' }}>{esc.ganancia_evento}</Td>
                    <Td style={{ color: '#00FF88' }}>{esc.ganancia_after}</Td>
                    <Td style={{ fontWeight: 'bold', color: esc.gran_total?.includes('-') ? '#EF4444' : '#00FF88', fontSize: '15px' }}>{esc.gran_total}</Td>
                    <Td><span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{esc.estado}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Inventario Barra Main */}
      {data.inventario_barra_main && (
        <Section title="INVENTARIO BARRA MAIN">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden', minWidth: '500px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Th>Producto</Th><Th>Costo</Th><Th>Venta</Th><Th>Margen</Th><Th>Unds (120 pax)</Th>
                </tr>
              </thead>
              <tbody>
                {data.inventario_barra_main.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Td style={{ fontWeight: 'bold' }}>{item.prod}</Td>
                    <Td style={{ color: '#EF4444' }}>{formatCOP(item.costo_und)}</Td>
                    <Td style={{ color: '#00FF88', fontWeight: 'bold' }}>{formatCOP(item.venta_und)}</Td>
                    <Td style={{ color: '#F59E0B' }}>{item.margen}</Td>
                    <Td>{item.unidades?.p120 || '—'} <span style={{ fontSize: '10px', color: '#9CA3AF' }}>({item.pacas?.p120} pacas)</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Proyecciones */}
      {data.proyecciones_rentabilidad_main?.escenarios && (
        <Section title="PROYECCIONES DE RENTABILIDAD">
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '14px' }}>{data.proyecciones_rentabilidad_main.base_datos}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {data.proyecciones_rentabilidad_main.escenarios.map((esc, i) => {
              const neg = esc.neto_final?.includes('-')
              return (
                <div key={i} style={{ background: neg ? 'rgba(239,68,68,0.06)' : 'rgba(0,255,136,0.06)', border: `1px solid ${neg ? 'rgba(239,68,68,0.25)' : 'rgba(0,255,136,0.2)'}`, borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff', marginBottom: '8px' }}>{esc.pax} PAX</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Taquilla: {esc.ingreso_taquilla}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Barra: {esc.ingreso_barra}</div>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>NETO</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: neg ? '#EF4444' : '#00FF88' }}>{esc.neto_final}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Costos Fijos */}
      {data.alt_a_costos && (
        <Section title="COSTOS FIJOS">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Th>Concepto</Th><Th>Categoría</Th><Th>Valor</Th>
                </tr>
              </thead>
              <tbody>
                {data.alt_a_costos.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Td>{c.concepto}</Td>
                    <Td><span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.07)', padding: '2px 5px', borderRadius: '3px' }}>{c.categoria}</span></Td>
                    <Td style={{ color: '#EF4444' }}>{formatCOP(c.valor)}</Td>
                  </tr>
                ))}
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Td style={{ fontWeight: 'bold' }}>TOTAL</Td><Td />
                  <Td style={{ fontWeight: 'bold', color: '#EF4444', fontSize: '15px' }}>
                    {formatCOP(data.alt_a_costos.reduce((s, c) => s + (c.valor || 0), 0))}
                  </Td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Micro ─────────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', borderLeft: `4px solid ${GREEN}`, paddingLeft: '12px' }}>{title}</h3>
      {children}
    </div>
  )
}
const Th = ({ children }) => <th style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left', padding: '10px 12px' }}>{children}</th>
const Td = ({ children, style }) => <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'white', verticalAlign: 'top', ...style }}>{children}</td>
