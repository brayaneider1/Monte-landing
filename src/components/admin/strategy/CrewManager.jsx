import React, { useState } from 'react'

const BRAYAN = '#38BDF8'
const MARIA  = '#F472B6'
const GREEN  = '#00FF88'
const GOLD   = '#F59E0B'
const RED    = '#EF4444'

const ROL_OPTS = ['artista','promotor','embajador']
const GESTOR_OPTS = [
  { val: 'brayan', label: 'Brayan', color: BRAYAN },
  { val: 'maria',  label: 'María',  color: MARIA },
  { val: 'ambos',  label: 'Ambos',  color: '#A78BFA' }
]
const PAGO_OPTS   = [
  { val: 'pendiente', label: 'Pendiente', color: RED },
  { val: 'parcial',   label: 'Parcial',   color: GOLD },
  { val: 'saldado',   label: 'Saldado',   color: GREEN }
]
const POST_TIPOS  = ['reel','story','post','tiktok']
const POST_STATUS = [
  { val: 'pendiente',  label: 'Pendiente',  color: '#9CA3AF' },
  { val: 'publicado',  label: 'Publicado ✓',color: GREEN },
  { val: 'bloqueado',  label: 'Bloqueado',  color: RED },
  { val: 'cancelado',  label: 'Cancelado',  color: RED }
]

const formatCOP = (v) => v ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v) : '$0'

export default function CrewManager({ crew, addPerson, updatePerson, deletePerson, addPost, updatePost, deletePost }) {
  const [activeRole, setActiveRole] = useState('artista')
  const [expandedPerson, setExpandedPerson] = useState(null)
  const [editingPerson, setEditingPerson] = useState(null)
  const [addingPost, setAddingPost] = useState(null)
  const [editingPost, setEditingPost] = useState(null)

  const people = crew?.[activeRole + 's'] || []

  const gestorColor = (g) => GESTOR_OPTS.find(o => o.val === g)?.color || '#9CA3AF'
  const pagoColor   = (p) => PAGO_OPTS.find(o => o.val === p)?.color   || '#9CA3AF'

  return (
    <div>
      {/* Role Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {ROL_OPTS.map(rol => (
          <button key={rol} onClick={() => setActiveRole(rol)}
            style={{ background: activeRole === rol ? GREEN : 'rgba(255,255,255,0.05)', color: activeRole === rol ? 'black' : '#9CA3AF', border: `1px solid ${activeRole === rol ? GREEN : 'rgba(255,255,255,0.1)'}`, padding: '7px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>
            {rol + 's'} ({(crew?.[rol + 's'] || []).length})
          </button>
        ))}
      </div>

      {/* People List */}
      {people.map(person => {
        const isExpanded = expandedPerson === person.id
        const isEditing  = editingPerson === person.id

        return (
          <div key={person.id} style={{ marginBottom: '10px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Card Header */}
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{person.nombre || <span style={{ color: '#9CA3AF' }}>(sin nombre)</span>}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {person.instagram && <span style={{ fontSize: '11px', color: MARIA }}>{person.instagram}</span>}
                  <span style={{ fontSize: '11px', color: gestorColor(person.gestionado_por) }}>→ {person.gestionado_por}</span>
                  <span style={{ fontSize: '11px', color: pagoColor(person.estado_pago), background: `rgba(${hexRgb(pagoColor(person.estado_pago))},0.1)`, padding: '1px 5px', borderRadius: '3px' }}>{person.estado_pago}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <div style={{ color: GREEN, fontWeight: 'bold' }}>{formatCOP(person.emv_total)}</div>
                <div style={{ color: '#9CA3AF' }}>EMV</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setExpandedPerson(isExpanded ? null : person.id)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  {isExpanded ? '▲' : '▼'}
                </button>
                <button onClick={() => setEditingPerson(isEditing ? null : person.id)}
                  style={{ background: 'rgba(56,189,248,0.1)', border: `1px solid rgba(56,189,248,0.3)`, color: BRAYAN, padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  ✏️
                </button>
                <button onClick={() => { if (confirm(`¿Eliminar a ${person.nombre}?`)) deletePerson(activeRole, person.id) }}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: RED, padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  🗑️
                </button>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <PersonEditForm person={person} onSave={(patch) => { updatePerson(activeRole, person.id, patch); setEditingPerson(null) }} onCancel={() => setEditingPerson(null)} />
            )}

            {/* Posts Expanded */}
            {isExpanded && !isEditing && (
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '10px' }}>Posts · {person.publicaciones_realizadas}/{person.publicaciones_planeadas} publicados</div>

                {(person.posts || []).map(post => {
                  const isEditPost = editingPost?.personId === person.id && editingPost?.postId === post.id
                  const statusOpt  = POST_STATUS.find(o => o.val === post.status) || POST_STATUS[0]

                  return (
                    <div key={post.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ background: 'rgba(255,255,255,0.08)', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>{post.tipo}</span>
                          <span style={{ background: 'rgba(255,255,255,0.08)', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>{post.canal}</span>
                          <span style={{ color: statusOpt.color, fontSize: '10px', fontWeight: 'bold' }}>{statusOpt.label}</span>
                          {post.fecha_programada && <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{post.fecha_programada}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => setEditingPost(isEditPost ? null : { personId: person.id, postId: post.id })}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', padding: '3px 7px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                          <button onClick={() => { if (confirm('¿Eliminar post?')) deletePost(activeRole, person.id, post.id) }}
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: RED, padding: '3px 7px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                        </div>
                      </div>

                      {/* Metrics summary */}
                      {(post.impresiones || post.alcance) && (
                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#9CA3AF', flexWrap: 'wrap' }}>
                          {post.impresiones && <span>👁 {post.impresiones.toLocaleString()}</span>}
                          {post.alcance     && <span>📡 {post.alcance.toLocaleString()}</span>}
                          {post.engagement_rate && <span>❤️ {post.engagement_rate}%</span>}
                          {post.emv_calculado && <span style={{ color: GREEN }}>EMV: {formatCOP(post.emv_calculado)}</span>}
                        </div>
                      )}

                      {isEditPost && (
                        <PostEditForm post={post} onSave={(patch) => { updatePost(activeRole, person.id, post.id, patch); setEditingPost(null) }} onCancel={() => setEditingPost(null)} />
                      )}
                    </div>
                  )
                })}

                {/* Add post */}
                {addingPost === person.id ? (
                  <QuickPostForm onSave={(data) => { addPost(activeRole, person.id, data); setAddingPost(null) }} onCancel={() => setAddingPost(null)} />
                ) : (
                  <button onClick={() => setAddingPost(person.id)} style={{ width: '100%', background: 'rgba(56,189,248,0.04)', border: '1px dashed rgba(56,189,248,0.3)', color: BRAYAN, padding: '8px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
                    ➕ Registrar post
                  </button>
                )}

                {/* UTM + código */}
                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '8px', fontSize: '11px' }}>
                  {person.utm_link && <div>🔗 UTM: <a href={person.utm_link} target="_blank" rel="noreferrer" style={{ color: GREEN }}>{person.utm_link}</a></div>}
                  {person.codigo_descuento && <div style={{ marginTop: '4px' }}>🎟️ Código: <strong style={{ color: GREEN }}>{person.codigo_descuento}</strong></div>}
                  <div style={{ marginTop: '4px', color: '#9CA3AF' }}>Boletas atribuidas: <strong style={{ color: 'white' }}>{person.boletas_atribuidas}</strong></div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Person */}
      <button onClick={() => addPerson(activeRole)}
        style={{ width: '100%', background: 'rgba(0,255,136,0.05)', border: '1px dashed rgba(0,255,136,0.3)', color: GREEN, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginTop: '8px' }}>
        ➕ Agregar {activeRole}
      </button>
    </div>
  )
}

// ── Sub-Forms ────────────────────────────────────────────────────────────────
function PersonEditForm({ person, onSave, onCancel }) {
  const [form, setForm] = useState({ ...person })
  const s = (k) => (v) => setForm(p => ({...p, [k]: v}))

  return (
    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'grid', gap: '10px' }}>
        <Row2>
          <F label="Nombre" val={form.nombre} set={s('nombre')} />
          <F label="Instagram" val={form.instagram} set={s('instagram')} />
        </Row2>
        <Row2>
          <F label="TikTok" val={form.tiktok} set={s('tiktok')} />
          <F label="Teléfono" val={form.telefono} set={s('telefono')} />
        </Row2>
        <Row2>
          <F label="UTM Link" val={form.utm_link} set={s('utm_link')} />
          <F label="Código descuento" val={form.codigo_descuento} set={s('codigo_descuento')} />
        </Row2>
        <F label="Acuerdo" val={form.acuerdo} set={s('acuerdo')} />

        <div>
          <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Gestionado por</div>
          <Pills opts={GESTOR_OPTS} val={form.gestionado_por} set={s('gestionado_por')} />
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Estado de pago</div>
          <Pills opts={PAGO_OPTS} val={form.estado_pago} set={s('estado_pago')} />
        </div>
        <Row2>
          <NumF label="Posts planeados" val={form.publicaciones_planeadas} set={s('publicaciones_planeadas')} />
          <NumF label="Boletas atribuidas" val={form.boletas_atribuidas} set={s('boletas_atribuidas')} />
        </Row2>
        <F label="Notas" val={form.notas} set={s('notas')} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={() => onSave(form)} style={{ background: '#00FF88', color: 'black', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>💾 Guardar</button>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

function QuickPostForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ tipo: 'reel', canal: 'instagram', fecha_programada: '', notas: '' })
  const s = (k) => (v) => setForm(p => ({...p, [k]: v}))
  return (
    <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
      <Row2>
        <div>
          <div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '3px' }}>Tipo</div>
          <select value={form.tipo} onChange={e => s('tipo')(e.target.value)} style={selStyle}>
            {POST_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '3px' }}>Canal</div>
          <select value={form.canal} onChange={e => s('canal')(e.target.value)} style={selStyle}>
            {['instagram','tiktok','whatsapp','facebook'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Row2>
      <F label="Fecha programada" val={form.fecha_programada} set={s('fecha_programada')} />
      <F label="Notas" val={form.notas} set={s('notas')} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={() => onSave(form)} style={{ background: '#38BDF8', color: 'black', border: 'none', padding: '8px 14px', borderRadius: '7px', fontWeight: 'bold', cursor: 'pointer', flex: 1, fontSize: '12px' }}>Registrar</button>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.04)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
      </div>
    </div>
  )
}

function PostEditForm({ post, onSave, onCancel }) {
  const [form, setForm] = useState({ ...post })
  const s = (k) => (v) => setForm(p => ({...p, [k]: v}))
  return (
    <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Estado</div>
        <Pills opts={POST_STATUS} val={form.status} set={s('status')} />
      </div>
      <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <NumF label="Impresiones" val={form.impresiones} set={s('impresiones')} />
        <NumF label="Alcance" val={form.alcance} set={s('alcance')} />
        <NumF label="ER (%)" val={form.engagement_rate} set={s('engagement_rate')} />
        <NumF label="Clicks" val={form.clicks_link} set={s('clicks_link')} />
        <NumF label="Boletas" val={form.boletas_atribuidas} set={s('boletas_atribuidas')} />
      </div>
      <F label="URL Post" val={form.url_post} set={s('url_post')} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={() => onSave(form)} style={{ background: '#00FF88', color: 'black', border: 'none', padding: '7px 14px', borderRadius: '7px', fontWeight: 'bold', cursor: 'pointer', flex: 1, fontSize: '12px' }}>Guardar</button>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.04)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)', padding: '7px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
      </div>
    </div>
  )
}

// ── Micro components ──────────────────────────────────────────────────────────
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
const selStyle   = { ...inputStyle }
const Row2 = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>{children}</div>
const F    = ({ label, val, set }) => (
  <div>
    <div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div>
    <input value={val || ''} onChange={e => set(e.target.value)} style={inputStyle} />
  </div>
)
const NumF = ({ label, val, set }) => (
  <div>
    <div style={{ fontSize: '9px', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div>
    <input type="number" value={val ?? ''} onChange={e => set(e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
  </div>
)
const Pills = ({ opts, val, set }) => (
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    {opts.map(o => (
      <button key={o.val} onClick={() => set(o.val)} style={{ background: val === o.val ? `rgba(${hexRgb(o.color)},0.2)` : 'rgba(255,255,255,0.04)', border: `1px solid ${val === o.val ? o.color : 'rgba(255,255,255,0.1)'}`, color: val === o.val ? o.color : '#9CA3AF', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
        {o.label}
      </button>
    ))}
  </div>
)

function hexRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
