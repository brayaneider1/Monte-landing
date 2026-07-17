import React, { useState } from 'react'

const BRAYAN = '#38BDF8'
const MARIA  = '#F472B6'
const GREEN  = '#00FF88'
const GOLD   = '#F59E0B'
const RED    = '#EF4444'

const STATUS_OPTS = [
  { val: 'pendiente',   label: 'Pendiente',   color: '#6B7280' },
  { val: 'en_progreso', label: 'En Progreso', color: GOLD },
  { val: 'publicado',   label: 'Publicado ✓', color: GREEN },
  { val: 'bloqueado',   label: 'Bloqueado',   color: RED }
]

const ASIGNADO_OPTS = [
  { val: 'brayan', label: 'Brayan', color: BRAYAN },
  { val: 'maria',  label: 'María',  color: MARIA  },
  { val: 'ambos',  label: 'Ambos',  color: '#A78BFA' },
  { val: 'externo',label: 'Externo',color: '#6B7280' }
]

const formatCOP = (v) => v ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) : '—'

const CPM = 8000

export default function ContentPlan({ strategy, updateTask, updateTaskMetrics, addTask, deleteTask }) {
  const [openFase, setOpenFase] = useState(strategy?.fases?.[0]?.id || null)
  const [editingTask, setEditingTask] = useState(null) // { faseId, taskId }
  const [metricsTask, setMetricsTask] = useState(null) // { faseId, taskId }
  const [addingTask, setAddingTask] = useState(null)   // faseId
  const [newTaskForm, setNewTaskForm] = useState({ pieza: '', canal: '', fecha: '', detalles: '', asignado_a: 'ambos' })

  const fases = strategy?.fases || []

  function statusBadge(status) {
    const opt = STATUS_OPTS.find(o => o.val === status) || STATUS_OPTS[0]
    return (
      <span style={{ background: `rgba(${hexRgb(opt.color)},0.15)`, color: opt.color, border: `1px solid rgba(${hexRgb(opt.color)},0.4)`, fontSize: '9px', padding: '2px 7px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
        {opt.label}
      </span>
    )
  }

  function assignedBadge(val) {
    const opt = ASIGNADO_OPTS.find(o => o.val === val) || ASIGNADO_OPTS[2]
    return (
      <span style={{ background: `rgba(${hexRgb(opt.color)},0.12)`, color: opt.color, fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
        {opt.label}
      </span>
    )
  }

  function calcEmv(alcance) {
    if (!alcance) return null
    return Math.round((alcance / 1000) * CPM)
  }

  return (
    <div>
      {fases.map(fase => {
        const isOpen = openFase === fase.id
        const total = fase.acciones.length
        const done = fase.acciones.filter(a => a.status === 'publicado').length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0

        return (
          <div key={fase.id} style={{ marginBottom: '12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Fase Header */}
            <button onClick={() => setOpenFase(isOpen ? null : fase.id)} style={{
              width: '100%', background: 'rgba(0,0,0,0.4)', border: 'none', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'white', textAlign: 'left'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{fase.nombre}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>{fase.objetivo}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: pct === 100 ? GREEN : GOLD }}>{pct}%</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{done}/{total}</div>
              </div>
              <span style={{ color: '#9CA3AF', fontSize: '18px' }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? GREEN : `linear-gradient(90deg,${BRAYAN},${MARIA})`, transition: 'width 0.4s' }} />
            </div>

            {/* Tasks */}
            {isOpen && (
              <div style={{ padding: '12px' }}>
                {fase.acciones.map(acc => {
                  const isEditing = editingTask?.faseId === fase.id && editingTask?.taskId === acc.id
                  const isMetrics = metricsTask?.faseId === fase.id && metricsTask?.taskId === acc.id

                  return (
                    <div key={acc.id} style={{
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px', padding: '12px', marginBottom: '10px'
                    }}>
                      {/* Task Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ background: GREEN, color: 'black', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>{acc.fecha}</span>
                          {statusBadge(acc.status)}
                          {assignedBadge(acc.asignado_a)}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setMetricsTask(isMetrics ? null : { faseId: fase.id, taskId: acc.id })}
                            style={{ background: 'rgba(56,189,248,0.1)', border: `1px solid rgba(56,189,248,0.3)`, color: BRAYAN, fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer' }}>
                            📊
                          </button>
                          <button onClick={() => setEditingTask(isEditing ? null : { faseId: fase.id, taskId: acc.id })}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer' }}>
                            ✏️
                          </button>
                          <button onClick={() => { if (confirm(`¿Eliminar "${acc.pieza}"?`)) deleteTask(fase.id, acc.id) }}
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: RED, fontSize: '11px', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer' }}>
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>{acc.pieza}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px', lineHeight: 1.5 }}>{acc.detalles}</div>
                      {acc.canal && <span style={{ fontSize: '10px', color: '#9CA3AF', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>{acc.canal}</span>}

                      {/* Edit Form */}
                      {isEditing && (
                        <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '10px', textTransform: 'uppercase' }}>Editar Tarea</div>
                          <TaskEditFields acc={acc} onSave={(patch) => { updateTask(fase.id, acc.id, patch); setEditingTask(null) }} onCancel={() => setEditingTask(null)} />
                        </div>
                      )}

                      {/* Metrics Panel */}
                      {isMetrics && (
                        <MetricsPanel acc={acc} faseId={fase.id} onSave={(patch) => { updateTaskMetrics(fase.id, acc.id, patch); setMetricsTask(null) }} onClose={() => setMetricsTask(null)} calcEmv={calcEmv} />
                      )}
                    </div>
                  )
                })}

                {/* Add Task Button */}
                {addingTask === fase.id ? (
                  <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '10px', padding: '14px', marginTop: '8px' }}>
                    <div style={{ fontSize: '11px', color: GREEN, marginBottom: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nueva Tarea</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <InlineInput label="Pieza / Título" value={newTaskForm.pieza} onChange={v => setNewTaskForm(p => ({...p, pieza: v}))} />
                      <InlineInput label="Fecha" value={newTaskForm.fecha} onChange={v => setNewTaskForm(p => ({...p, fecha: v}))} />
                      <InlineInput label="Canal" value={newTaskForm.canal} onChange={v => setNewTaskForm(p => ({...p, canal: v}))} />
                      <InlineTextarea label="Detalles" value={newTaskForm.detalles} onChange={v => setNewTaskForm(p => ({...p, detalles: v}))} />
                      <div>
                        <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Asignado a</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {ASIGNADO_OPTS.map(o => (
                            <button key={o.val} onClick={() => setNewTaskForm(p => ({...p, asignado_a: o.val}))}
                              style={{ background: newTaskForm.asignado_a === o.val ? `rgba(${hexRgb(o.color)},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${newTaskForm.asignado_a === o.val ? o.color : 'rgba(255,255,255,0.1)'}`, color: newTaskForm.asignado_a === o.val ? o.color : '#9CA3AF', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={() => { addTask(fase.id, newTaskForm); setAddingTask(null); setNewTaskForm({ pieza: '', canal: '', fecha: '', detalles: '', asignado_a: 'ambos' }) }}
                        style={{ background: GREEN, color: 'black', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                        Guardar
                      </button>
                      <button onClick={() => setAddingTask(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingTask(fase.id)} style={{
                    width: '100%', background: 'rgba(0,255,136,0.04)', border: '1px dashed rgba(0,255,136,0.3)',
                    color: GREEN, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '4px'
                  }}>
                    ➕ Agregar tarea a esta fase
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaskEditFields({ acc, onSave, onCancel }) {
  const [form, setForm] = useState({
    status: acc.status,
    asignado_a: acc.asignado_a,
    notas_reales: acc.notas_reales || '',
    pieza: acc.pieza || '',
    detalles: acc.detalles || '',
    canal: acc.canal || '',
    fecha: acc.fecha || ''
  })

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <div>
        <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Estado</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_OPTS.map(o => (
            <button key={o.val} onClick={() => setForm(p => ({...p, status: o.val}))}
              style={{ background: form.status === o.val ? `rgba(${hexRgb(o.color)},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.status === o.val ? o.color : 'rgba(255,255,255,0.1)'}`, color: form.status === o.val ? o.color : '#9CA3AF', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Asignado a</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {ASIGNADO_OPTS.map(o => (
            <button key={o.val} onClick={() => setForm(p => ({...p, asignado_a: o.val}))}
              style={{ background: form.asignado_a === o.val ? `rgba(${hexRgb(o.color)},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.asignado_a === o.val ? o.color : 'rgba(255,255,255,0.1)'}`, color: form.asignado_a === o.val ? o.color : '#9CA3AF', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <InlineInput label="Título" value={form.pieza} onChange={v => setForm(p => ({...p, pieza: v}))} />
      <InlineInput label="Fecha" value={form.fecha} onChange={v => setForm(p => ({...p, fecha: v}))} />
      <InlineInput label="Canal" value={form.canal} onChange={v => setForm(p => ({...p, canal: v}))} />
      <InlineTextarea label="Detalles" value={form.detalles} onChange={v => setForm(p => ({...p, detalles: v}))} />
      <InlineTextarea label="Notas / Resultado real" value={form.notas_reales} onChange={v => setForm(p => ({...p, notas_reales: v}))} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onSave(form)} style={{ background: GREEN, color: 'black', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>💾 Guardar</button>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

function MetricsPanel({ acc, onSave, onClose, calcEmv }) {
  const [form, setForm] = useState({ ...acc.metricas })

  const emv = calcEmv(form.alcance)

  return (
    <div style={{ marginTop: '12px', background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '14px' }}>
      <div style={{ fontSize: '10px', color: BRAYAN, marginBottom: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>📊 Métricas Meta</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <NumInput label="Impresiones" value={form.impresiones} onChange={v => setForm(p => ({...p, impresiones: v}))} />
        <NumInput label="Alcance" value={form.alcance} onChange={v => setForm(p => ({...p, alcance: v}))} />
        <NumInput label="Engagement Rate (%)" value={form.engagement_rate} onChange={v => setForm(p => ({...p, engagement_rate: v}))} />
        <NumInput label="Clicks al link" value={form.clicks_link} onChange={v => setForm(p => ({...p, clicks_link: v}))} />
        <NumInput label="Shares" value={form.shares} onChange={v => setForm(p => ({...p, shares: v}))} />
        <NumInput label="Saves" value={form.saves} onChange={v => setForm(p => ({...p, saves: v}))} />
        <NumInput label="Boletas atribuidas" value={form.boletas_atribuidas} onChange={v => setForm(p => ({...p, boletas_atribuidas: v}))} />
        <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '6px', padding: '8px' }}>
          <div style={{ fontSize: '9px', color: '#9CA3AF' }}>EMV Calculado</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: GREEN }}>{emv ? `$${emv.toLocaleString('es-CO')}` : '—'}</div>
        </div>
      </div>
      <InlineInput label="URL del Post" value={form.url_post || ''} onChange={v => setForm(p => ({...p, url_post: v}))} style={{ marginTop: '8px' }} />
      <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '8px', fontStyle: 'italic' }}>
        🔗 Integración Meta API — próxima fase. Por ahora, ingresa las métricas manualmente.
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={() => onSave({ ...form, emv_calculado: emv })} style={{ background: BRAYAN, color: 'black', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>💾 Guardar Métricas</button>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cerrar</button>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function InlineInput({ label, value, onChange, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '3px' }}>{label}</div>
      <input value={value || ''} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function InlineTextarea({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '3px' }}>{label}</div>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3}
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
    </div>
  )
}

function NumInput({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '3px' }}>{label}</div>
      <input type="number" value={value ?? ''} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}

function hexRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
