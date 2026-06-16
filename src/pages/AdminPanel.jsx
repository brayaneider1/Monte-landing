import { useState, useEffect } from 'react'
import { getOrders, registerManualSale, formatCOP } from '../services/api'
import eventsData from '../data/events.json'
import './AdminPanel.css'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

const TABS = ['VENTA EN MANO', 'COMPRADORES', 'RESUMEN']

const emptyForm = {
  name: '', doc: '', email: '', phone: '',
  eventId: eventsData[0]?.id || '',
  qty: 1,
  method: 'efectivo',
}

export default function AdminPanel() {
  const [authed, setAuthed]   = useState(false)
  const [pin, setPin]         = useState('')
  const [pinErr, setPinErr]   = useState('')
  const [tab, setTab]         = useState(0)
  const [orders, setOrders]   = useState([])
  const [form, setForm]       = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [formErr, setFormErr] = useState('')
  const [filterEvt, setFilterEvt] = useState('all')

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthed(true)
      loadOrders()
    } else {
      setPinErr('PIN incorrecto.')
      setPin('')
    }
  }

  const loadOrders = async () => {
    try {
      const data = await getOrders(ADMIN_PIN)
      setOrders(data)
    } catch { setOrders([]) }
  }

  useEffect(() => {
    if (authed && tab > 0) loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authed])

  const handleForm = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'qty' ? Math.max(1, +value) : value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormErr('')
    setSuccess('')
    if (!form.name || !form.doc) {
      setFormErr('Nombre y documento son obligatorios.')
      return
    }
    setLoading(true)
    try {
      const event = eventsData.find(ev => ev.id === form.eventId)
      const order = await registerManualSale({
        buyer: { name: form.name, doc: form.doc, email: form.email, phone: form.phone },
        items: [{
          eventId: form.eventId,
          eventName: event?.name || form.eventId,
          qty: form.qty,
          priceUnit: event?.price || 0,
          total: form.qty * (event?.price || 0),
        }],
        method: form.method,
        pin: ADMIN_PIN,
      })
      setSuccess(`✓ Venta registrada — Orden ${order.id}`)
      setForm(emptyForm)
      loadOrders()
    } catch (err) {
      setFormErr('Error al registrar la venta.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ── Filtered orders ── */
  const filtered = filterEvt === 'all'
    ? orders
    : orders.filter(o =>
        o.items?.some(i => i.eventId === filterEvt)
      )

  /* ── Summary per event ── */
  const summary = eventsData.map(evt => {
    const evtOrders = orders.filter(o => o.items?.some(i => i.eventId === evt.id))
    const online  = evtOrders.filter(o => o.method === 'online').reduce((s, o) => s + (o.items?.find(i => i.eventId === evt.id)?.qty || 0), 0)
    const manual  = evtOrders.filter(o => o.method !== 'online').reduce((s, o) => s + (o.items?.find(i => i.eventId === evt.id)?.qty || 0), 0)
    const total   = online + manual
    const revenue = evtOrders.reduce((s, o) => s + (o.items?.find(i => i.eventId === evt.id)?.total || 0), 0)
    return { ...evt, online, manual, total, revenue }
  })

  /* ── RENDER: Login ── */
  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <div className="admin-logo">LOOP.RAVE</div>
          <p className="admin-login-sub">Panel de administración</p>
          <form onSubmit={handleLogin} className="admin-pin-form">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="PIN ••••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="admin-pin-input"
              autoFocus
            />
            {pinErr && <p className="admin-error">{pinErr}</p>}
            <button type="submit" className="admin-btn-primary">ENTRAR</button>
          </form>
        </div>
      </div>
    )
  }

  /* ── RENDER: Dashboard ── */
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-logo">LOOP.RAVE — ADMIN</div>
        <div className="admin-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`admin-tab ${tab === i ? 'active' : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="admin-signout" onClick={() => { setAuthed(false); setPin('') }}>
          SALIR
        </button>
      </div>

      <div className="admin-body">

        {/* ─── TAB 0: VENTA EN MANO ─── */}
        {tab === 0 && (
          <div className="admin-section">
            <h2 className="admin-section-title">Registrar venta en mano</h2>
            <p className="admin-section-sub">
              Usa esto cuando alguien pague en efectivo o con datáfono directamente.
              La venta queda registrada y el comprador queda en la lista de acceso.
            </p>

            <form className="admin-form" onSubmit={handleRegister}>
              <div className="af-grid">
                <div className="af-field">
                  <label htmlFor="af-event">Evento *</label>
                  <select id="af-event" name="eventId" value={form.eventId} onChange={handleForm}>
                    {eventsData.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>

                <div className="af-field">
                  <label htmlFor="af-qty">Cantidad *</label>
                  <input
                    id="af-qty"
                    name="qty"
                    type="number"
                    min="1"
                    max="20"
                    value={form.qty}
                    onChange={handleForm}
                  />
                </div>

                <div className="af-field">
                  <label htmlFor="af-name">Nombre completo *</label>
                  <input
                    id="af-name"
                    name="name"
                    value={form.name}
                    onChange={handleForm}
                    placeholder="Nombre del comprador"
                  />
                </div>

                <div className="af-field">
                  <label htmlFor="af-doc">Cédula / Documento *</label>
                  <input
                    id="af-doc"
                    name="doc"
                    value={form.doc}
                    onChange={handleForm}
                    placeholder="Número de documento"
                  />
                </div>

                <div className="af-field">
                  <label htmlFor="af-email">Correo <span className="optional">(opcional)</span></label>
                  <input
                    id="af-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleForm}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="af-field">
                  <label htmlFor="af-method">Método de pago *</label>
                  <select id="af-method" name="method" value={form.method} onChange={handleForm}>
                    <option value="efectivo">Efectivo</option>
                    <option value="datáfono">Datáfono</option>
                    <option value="nequi">Nequi / Daviplata</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Order preview */}
              {(() => {
                const evt = eventsData.find(ev => ev.id === form.eventId)
                const total = evt ? evt.price * form.qty : 0
                return (
                  <div className="af-preview">
                    <span>{evt?.name} × {form.qty}</span>
                    <span className="af-preview-total">{formatCOP(total)}</span>
                  </div>
                )
              })()}

              {formErr && <p className="admin-error">{formErr}</p>}
              {success && <p className="admin-success">{success}</p>}

              <button type="submit" className="admin-btn-primary" disabled={loading}>
                {loading ? 'REGISTRANDO…' : 'REGISTRAR VENTA'}
              </button>
            </form>
          </div>
        )}

        {/* ─── TAB 1: COMPRADORES ─── */}
        {tab === 1 && (
          <div className="admin-section">
            <div className="admin-list-header">
              <h2 className="admin-section-title" style={{ margin: 0 }}>
                Lista de compradores
                <span className="admin-count">{filtered.length}</span>
              </h2>
              <select
                className="admin-filter-select"
                value={filterEvt}
                onChange={e => setFilterEvt(e.target.value)}
              >
                <option value="all">Todos los eventos</option>
                {eventsData.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0
              ? <p className="admin-empty">No hay registros todavía.</p>
              : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ORDEN</th>
                        <th>NOMBRE</th>
                        <th>DOC</th>
                        <th>EVENTO</th>
                        <th>CANT</th>
                        <th>MÉTODO</th>
                        <th>TOTAL</th>
                        <th>FECHA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(o => {
                        const mainItem = o.items?.[0]
                        return (
                          <tr key={o.id}>
                            <td className="order-id-cell">{o.id}</td>
                            <td>{o.buyer?.name || '—'}</td>
                            <td>{o.buyer?.doc || '—'}</td>
                            <td>{mainItem?.eventName || o.items?.map(i => i.eventName).join(', ') || '—'}</td>
                            <td className="qty-cell">{o.items?.reduce((s, i) => s + i.qty, 0)}</td>
                            <td>
                              <span className={`method-badge method-${o.method}`}>
                                {o.method}
                              </span>
                            </td>
                            <td className="total-cell">
                              {formatCOP(o.items?.reduce((s, i) => s + (i.total || 0), 0))}
                            </td>
                            <td className="date-cell">
                              {new Date(o.createdAt).toLocaleString('es-CO', {
                                day: '2-digit', month: '2-digit',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {/* ─── TAB 2: RESUMEN ─── */}
        {tab === 2 && (
          <div className="admin-section">
            <h2 className="admin-section-title">Resumen de ventas</h2>
            <div className="summary-cards">
              {summary.map(evt => (
                <div key={evt.id} className={`summary-card sc-${evt.id}`}>
                  <div className="sc-name">{evt.name}</div>
                  <div className="sc-stats">
                    <div className="sc-stat">
                      <span className="sc-stat-val">{evt.online}</span>
                      <span className="sc-stat-lbl">Online</span>
                    </div>
                    <div className="sc-stat">
                      <span className="sc-stat-val">{evt.manual}</span>
                      <span className="sc-stat-lbl">En mano</span>
                    </div>
                    <div className="sc-stat sc-total-stat">
                      <span className="sc-stat-val">{evt.total}</span>
                      <span className="sc-stat-lbl">Total</span>
                    </div>
                  </div>
                  <div className="sc-revenue">{formatCOP(evt.revenue)}</div>
                </div>
              ))}
            </div>

            <div className="summary-total-box">
              <span>TOTAL GLOBAL</span>
              <span className="stb-amount">
                {formatCOP(summary.reduce((s, e) => s + e.revenue, 0))}
              </span>
            </div>

            <button
              className="admin-btn-ghost"
              style={{ marginTop: '12px' }}
              onClick={loadOrders}
            >
              ACTUALIZAR DATOS
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
