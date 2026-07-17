import React, { useState } from 'react'
import { STAGES } from '../../../hooks/useSponsorPipeline'

const BRAYAN = '#38BDF8'
const MARIA  = '#F472B6'
const GREEN  = '#00FF88'
const GOLD   = '#F59E0B'
const RED    = '#EF4444'

const STAGE_LABELS = {
  prospecto:     { label: 'Prospecto',      color: '#6B7280' },
  contactado:    { label: 'Contactado',     color: BRAYAN },
  pitch_enviado: { label: 'Pitch Enviado',  color: '#A78BFA' },
  negociando:    { label: 'Negociando',     color: GOLD },
  cerrado:       { label: '✅ Cerrado',     color: GREEN },
  perdido:       { label: '❌ Perdido',     color: RED }
}

const GESTOR_OPTS = [
  { val: 'brayan', label: 'Brayan', color: BRAYAN },
  { val: 'maria',  label: 'María',  color: MARIA  },
  { val: 'ambos',  label: 'Ambos',  color: '#A78BFA' }
]

const formatCOP = (v) => v ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) : '$0'

const today = () => new Date().toISOString().slice(0, 10)
const isOverdue = (sp) => {
  if (!sp.proximo_seguimiento || sp.etapa === 'cerrado' || sp.etapa === 'perdido') return false
  return new Date(sp.proximo_seguimiento) < new Date()
}

export default function SponsorPipeline({ pipeline, addSponsor, updateSponsor, deleteSponsor, advanceStage, getPipelineStats }) {
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const { valorTotal, vencidos } = getPipelineStats()

  const filtered = filter === 'all'
    ? pipeline
    : filter === 'vencidos'
    ? pipeline.filter(isOverdue)
    : pipeline.filter(sp => sp.gestionado_por === filter)

  return (
    <div>
      {/* Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {STAGES.map(stage => {
          const count = pipeline.filter(sp => sp.etapa === stage).length
          const cfg   = STAGE_LABELS[stage]
          return (
            <div key={stage} style={{ background: `rgba(${hexRgb(cfg.color)},0.08)`, border: `1px solid rgba(${hexRgb(cfg.color)},0.25)`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: cfg.color }}>{count}</div>
              <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', marginTop: '2px' }}>{cfg.label}</div>
            </div>
          )
        })}
        <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: GREEN }}>{formatCOP(valorTotal)}</div>
          <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', marginTop: '2px' }}>Cerrados</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {[
          { val: 'all',     label: 'Todos' },
          { val: 'brayan',  label: 'Brayan', color: BRAYAN },
          { val: 'maria',   label: 'María',  color: MARIA  },
          { val: 'vencidos',label: `⚠️ Vencidos (${vencidos.length})`, color: RED }
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            style={{ background: filter === f.val ? (f.color || GREEN) : 'rgba(255,255,255,0.05)', color: filter === f.val ? (f.color === GREEN || !f.color ? 'black' : 'white') : '#9CA3AF', border: `1px solid ${filter === f.val ? (f.color || GREEN) : 'rgba(255,255,255,0.1)'}`, padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sponsor Cards */}
      {filtered.map(sp => {
        const isExpanded = expandedId === sp.id
        const isEditing  = editingId  === sp.id
        const overdue    = isOverdue(sp)
        const stage      = STAGE_LABELS[sp.etapa] || STAGE_LABELS.prospecto
        const nextStage  = STAGES[STAGES.indexOf(sp.etapa) + 1]

        return (
          <div key={sp.id} style={{ marginBottom: '10px', border: `1px solid ${overdue ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', overflow: 'hidden' }}>
            {overdue && (
              <div style={{ background: 'rgba(239,68,68,0.1)', padding: '5px 14px', fontSize: '10px', color: RED, fontWeight: 'bold' }}>
                ⚠️ SEGUIMIENTO VENCIDO — {sp.proximo_seguimiento}
              </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{sp.nombre}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>{sp.industria}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                  <span style={{ background: `rgba(${hexRgb(stage.color)},0.15)`, color: stage.color, fontSize: '9px', padding: '2px 7px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>{stage.label}</span>
                  <span style={{ color: sp.gestionado_por === 'brayan' ? BRAYAN : MARIA, fontSize: '11px' }}>→ {sp.gestionado_por}</span>
                  <span style={{ color: GREEN, fontSize: '11px' }}>{formatCOP(sp.valor_estimado)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {nextStage && !['cerrado','perdido'].includes(sp.etapa) && (
                  <button onClick={() => advanceStage(sp.id)}
                    style={{ background: `rgba(${hexRgb(STAGE_LABELS[nextStage]?.color || GREEN)},0.15)`, border: `1px solid ${STAGE_LABELS[nextStage]?.color || GREEN}`, color: STAGE_LABELS[nextStage]?.color || GREEN, padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                    → {STAGE_LABELS[nextStage]?.label}
                  </button>
                )}
                <button onClick={() => setExpandedId(isExpanded ? null : sp.id)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  {isExpanded ? '▲' : '▼'}
                </button>
                <button onClick={() => setEditingId(isEditing ? null : sp.id)}
                  style={{ background: 'rgba(56,189,248,0.08)', border: `1px solid rgba(56,189,248,0.3)`, color: BRAYAN, padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                <button onClick={() => { if (confirm(`¿Eliminar ${sp.nombre}?`)) deleteSponsor(sp.id) }}
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: RED, padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
              </div>
            </div>

            {isExpanded && !isEditing && (
              <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)' }}>
                <Info label="Propuesta" val={sp.oferta_propuesta} />
                {sp.contraprestacion_acordada && <Info label="Acordado" val={sp.contraprestacion_acordada} highlight={GREEN} />}
                {sp.bono_monte && <Info label="Bono MONTE" val={sp.bono_monte} highlight={GOLD} />}
                <Row2>
                  <Info label="Último contacto" val={sp.fecha_ultimo_contacto || '—'} />
                  <Info label="Próximo seguimiento" val={sp.proximo_seguimiento || '—'} highlight={overdue ? RED : undefined} />
                </Row2>
                {sp.notas && <Info label="Notas" val={sp.notas} />}
                {sp.instagram && <div style={{ marginTop: '6px', fontSize: '12px', color: MARIA }}>{sp.instagram}</div>}
                {sp.telefono  && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>📞 {sp.telefono}</div>}
              </div>
            )}

            {isEditing && (
              <SponsorEditForm sp={sp} onSave={(patch) => { updateSponsor(sp.id, patch); setEditingId(null) }} onCancel={() => setEditingId(null)} />
            )}
          </div>
        )
      })}

      {/* Add Sponsor */}
      <button onClick={() => addSponsor()}
        style={{ width: '100%', background: 'rgba(0,255,136,0.04)', border: '1px dashed rgba(0,255,136,0.3)', color: GREEN, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginTop: '8px' }}>
        ➕ Agregar prospecto
      </button>
    </div>
  )
}

function SponsorEditForm({ sp, onSave, onCancel }) {
  const [form, setForm] = useState({ ...sp })
  const s = (k) => (v) => setForm(p => ({...p, [k]: v}))

  return (
    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        <Row2>
          <F label="Nombre" val={form.nombre} set={s('nombre')} />
          <F label="Industria" val={form.industria} set={s('industria')} />
        </Row2>
        <Row2>
          <F label="Contacto" val={form.contacto} set={s('contacto')} />
          <F label="Instagram" val={form.instagram} set={s('instagram')} />
        </Row2>
        <Row2>
          <F label="Teléfono" val={form.telefono} set={s('telefono')} />
          <NumF label="Valor estimado (COP)" val={form.valor_estimado} set={s('valor_estimado')} />
        </Row2>
        <div>
          <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Etapa</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {STAGES.map(st => {
              const cfg = STAGE_LABELS[st]
              return (
                <button key={st} onClick={() => s('etapa')(st)}
                  style={{ background: form.etapa === st ? `rgba(${hexRgb(cfg.color)},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.etapa === st ? cfg.color : 'rgba(255,255,255,0.1)'}`, color: form.etapa === st ? cfg.color : '#9CA3AF', padding: '4px 9px', borderRadius: '5px', cursor: 'pointer', fontSize: '10px' }}>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Gestionado por</div>
          <Pills opts={GESTOR_OPTS} val={form.gestionado_por} set={s('gestionado_por')} />
        </div>
        <TextareaF label="Propuesta" val={form.oferta_propuesta} set={s('oferta_propuesta')} />
        <TextareaF label="Contraprestación acordada" val={form.contraprestacion_acordada} set={s('contraprestacion_acordada')} />
        <TextareaF label="Bono MONTE" val={form.bono_monte} set={s('bono_monte')} />
        <Row2>
          <F label="Último contacto" val={form.fecha_ultimo_contacto} set={s('fecha_ultimo_contacto')} />
          <F label="Próximo seguimiento" val={form.proximo_seguimiento} set={s('proximo_seguimiento')} />
        </Row2>
        <TextareaF label="Notas" val={form.notas} set={s('notas')} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={() => onSave(form)} style={{ background: '#00FF88', color: 'black', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>💾 Guardar</button>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

// ── Micro ─────────────────────────────────────────────────────────────────────
const iStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
const Row2       = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>{children}</div>
const F          = ({ label, val, set }) => (<div><div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div><input value={val || ''} onChange={e => set(e.target.value)} style={iStyle} /></div>)
const NumF       = ({ label, val, set }) => (<div><div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div><input type="number" value={val ?? ''} onChange={e => set(e.target.value ? Number(e.target.value) : 0)} style={iStyle} /></div>)
const TextareaF  = ({ label, val, set }) => (<div><div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div><textarea value={val || ''} onChange={e => set(e.target.value)} rows={2} style={{ ...iStyle, resize: 'vertical' }} /></div>)
const Info       = ({ label, val, highlight }) => (<div style={{ marginBottom: '8px' }}><div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '2px', textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: '13px', color: highlight || 'white' }}>{val}</div></div>)
const Pills      = ({ opts, val, set }) => (<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{opts.map(o => (<button key={o.val} onClick={() => set(o.val)} style={{ background: val === o.val ? `rgba(${hexRgb(o.color)},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${val === o.val ? o.color : 'rgba(255,255,255,0.1)'}`, color: val === o.val ? o.color : '#9CA3AF', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>{o.label}</button>))}</div>)
function hexRgb(hex) { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `${r},${g},${b}` }
