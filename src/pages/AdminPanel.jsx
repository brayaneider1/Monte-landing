import { useState, useEffect } from 'react'
import { getOrders, registerManualSale, formatCOP, getBuyers, createBuyer, updateBuyer, deleteBuyer, loginAdmin } from '../services/api'
import eventsData from '../data/events.json'
import QRScanner from '../components/admin/QRScanner'
import StrategyDashboard from '../components/admin/StrategyDashboard'
import './AdminPanel.css'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

const TABS = ['VENTA EN MANO', 'ÓRDENES', 'RESUMEN', 'ESCANEAR', 'COMPRADORES (CRM)']

const emptyForm = {
  name: '', doc: '', email: '', phone: '', instagram: '',
  eventId: eventsData[0]?.id || '',
  qty: 1,
  method: 'efectivo',
}

export default function AdminPanel() {
  const [authed, setAuthed]   = useState(false)
  const [token, setToken]     = useState(null)
  const [pin, setPin]         = useState('')
  const [pinErr, setPinErr]   = useState('')
  const [tab, setTab]         = useState(0)
  const [orders, setOrders]   = useState([])
  const [buyers, setBuyers]   = useState([])
  const [form, setForm]       = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [formErr, setFormErr] = useState('')
  const [filterEvt, setFilterEvt] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [buyerSearch, setBuyerSearch] = useState('')

  // Buyers CRUD State
  const emptyBuyerForm = { id: null, name: '', doc_type: 'CC', doc: '', email: '', phone: '', instagram: '' }
  const [buyerModalOpen, setBuyerModalOpen] = useState(false)
  const [buyerForm, setBuyerForm] = useState(emptyBuyerForm)
  const [buyerErr, setBuyerErr] = useState('')

  const loadOrders = async (authToken) => {
    try {
      const data = await getOrders(authToken)
      setOrders(data)
    } catch (err) {
      setPinErr('Error cargando órdenes.')
    }
  }

  const loadBuyers = async (authToken) => {
    try {
      const data = await getBuyers(authToken)
      setBuyers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setPinErr('')
    try {
      const accessToken = await loginAdmin(pin)
      setToken(accessToken)
      await loadOrders(accessToken)
      await loadBuyers(accessToken)
      setAuthed(true)
    } catch (err) {
      setPinErr(err.message || 'PIN incorrecto.')
      setAuthed(false)
    }
  }

  // --- BUYER CRUD HANDLERS ---
  const handleBuyerForm = (e) => {
    const val = e.target.name === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value
    setBuyerForm({ ...buyerForm, [e.target.name]: val })
  }
  
  const saveBuyer = async (e) => {
    e.preventDefault()
    setBuyerErr('')
    try {
      if (buyerForm.id) {
        await updateBuyer(buyerForm.id, buyerForm, token)
      } else {
        await createBuyer(buyerForm, token)
      }
      setBuyerModalOpen(false)
      loadBuyers(token)
    } catch (err) {
      setBuyerErr(err.message)
    }
  }

  const handleDeleteBuyer = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este comprador? (Puede fallar si tiene órdenes asociadas)')) return
    try {
      await deleteBuyer(id, token)
      loadBuyers(token)
    } catch (err) {
      alert(err.message)
    }
  }

  const openBuyerModal = (buyer = emptyBuyerForm) => {
    setBuyerForm(buyer)
    setBuyerErr('')
    setBuyerModalOpen(true)
  }
  // ---------------------------

  useEffect(() => {
    if (authed && token && tab > 0) {
      if (tab === 1 || tab === 2) loadOrders(token)
      if (tab === 4) loadBuyers(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authed, token])

  const handleForm = (e) => {
    const { name, value } = e.target
    let finalValue = value
    if (name === 'qty') finalValue = Math.max(1, +value)
    if (name === 'phone') finalValue = value.replace(/\D/g, '')
    setForm(f => ({ ...f, [name]: finalValue }))
  }

  const handlePhoneBlur = async () => {
    if (!form.phone) return
    try {
      const response = await fetch('https://loop-core-production.up.railway.app/api/v1/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.buyer) {
          setForm(f => ({
            ...f,
            name: f.name || data.buyer.name || '',
            email: f.email || data.buyer.email || '',
            doc: f.doc || data.buyer.doc || '',
            instagram: f.instagram || data.buyer.instagram || '',
          }))
        }
      }
    } catch (err) {
      console.error("Error looking up buyer by phone in admin panel:", err)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormErr('')
    setSuccess('')
    if (!form.name || !form.doc || !form.phone) {
      setFormErr('Nombre, documento y teléfono son obligatorios.')
      return
    }
    setLoading(true)
    try {
      const event = eventsData.find(ev => ev.id === form.eventId)
      const eventSlug = event?.slug || 'selvatica-2026'
      const ticketType = eventSlug === 'selvatica-2026' ? 'preventa' : 'general'

      const order = await registerManualSale({
        event_slug: eventSlug,
        buyer: { 
          name: form.name, 
          doc: form.doc, 
          email: form.email || null, 
          phone: form.phone,
          instagram: form.instagram ? form.instagram.trim() : null
        },
        items: [{
          ticket_type: ticketType,
          quantity: form.qty
        }],
        payment_method: form.method,
        token: token,
      })
      setSuccess(`✓ Venta registrada — Orden ${order.order_ref || order.id}`)
      setForm(emptyForm)
      if (tab === 1 || tab === 2) loadOrders(token)
      if (tab === 4) loadBuyers(token)
    } catch (err) {
      setFormErr('Error al registrar la venta.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`¿Estás seguro de eliminar la orden #${orderId}? Se borrarán también los tickets.`)) return
    try {
      const response = await fetch(`https://loop-core-production.up.railway.app/api/v1/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        alert('Orden eliminada correctamente')
        loadOrders(token)
      } else {
        const data = await response.json()
        alert(`Error al eliminar: ${data.detail || 'Desconocido'}`)
      }
    } catch (err) {
      alert('Error de red al eliminar la orden')
    }
  }

  /* ── Filtered orders ── */
  let filtered = filterEvt === 'all'
    ? orders
    : orders.filter(o => o.items?.some(i => String(i.eventId) === String(filterEvt)))

  if (orderSearch) {
    const s = orderSearch.toLowerCase()
    filtered = filtered.filter(o => 
      (o.order_ref && o.order_ref.toLowerCase().includes(s)) || 
      (o.buyer?.name && o.buyer.name.toLowerCase().includes(s)) || 
      (o.buyer?.doc && o.buyer.doc.includes(s)) ||
      (o.buyer?.phone && o.buyer.phone.includes(s))
    )
  }

  /* ── Summary per event ── */
  const summary = eventsData.map(evt => {
    const evtOrders = orders.filter(o => o.items?.some(i => String(i.eventId) === String(evt.id)))
    const online  = evtOrders.filter(o => o.method === 'online').reduce((s, o) => s + (o.items?.find(i => String(i.eventId) === String(evt.id))?.qty || 0), 0)
    const manual  = evtOrders.filter(o => o.method !== 'online').reduce((s, o) => s + (o.items?.find(i => String(i.eventId) === String(evt.id))?.qty || 0), 0)
    const total   = online + manual
    const revenue = evtOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0)
    return { ...evt, online, manual, total, revenue }
  })

  /* ── Filtered buyers ── */
  let filteredBuyers = buyers
  if (buyerSearch) {
    const s = buyerSearch.toLowerCase()
    filteredBuyers = filteredBuyers.filter(b => 
      (b.name && b.name.toLowerCase().includes(s)) || 
      (b.email && b.email.toLowerCase().includes(s)) || 
      (b.doc && b.doc.includes(s)) ||
      (b.phone && b.phone.includes(s))
    )
  }

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
        <button className="admin-signout" onClick={() => { setAuthed(false); setPin(''); setToken(null) }}>
          SALIR
        </button>
      </div>

      <nav className="admin-bottom-nav">
        <button className={`admin-nav-item ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
          <svg viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>VENTA</span>
        </button>
        <button className={`admin-nav-item ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
          <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>ÓRDENES</span>
        </button>
        <button className={`admin-nav-item ${tab === 2 ? 'active' : ''}`} onClick={() => setTab(2)}>
          <svg viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>RESUMEN</span>
        </button>
        <button className={`admin-nav-item ${tab === 3 ? 'active' : ''}`} onClick={() => setTab(3)}>
          <svg viewBox="0 0 24 24"><path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>ESCANEAR</span>
        </button>
        <button className={`admin-nav-item ${tab === 4 ? 'active' : ''}`} onClick={() => setTab(4)}>
          <svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>CRM</span>
        </button>
        <button className={`admin-nav-item ${tab === 5 ? 'active' : ''}`} onClick={() => setTab(5)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span>ESTRATEGIA</span>
        </button>
      </nav>

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
                  <label htmlFor="af-phone">Teléfono / WhatsApp *</label>
                  <input
                    id="af-phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleForm}
                    onBlur={handlePhoneBlur}
                    placeholder="Ej. 3124524674"
                    required
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
                  <label htmlFor="af-instagram">Usuario de Instagram <span className="optional">(opcional)</span></label>
                  <input
                    id="af-instagram"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleForm}
                    placeholder="Ej. @brayan_rave"
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
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="admin-filter-select" 
                  placeholder="Buscar orden (nombre, doc, ref)..." 
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
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
                        <th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(o => {
                        const mainItem = o.items?.[0]
                        return (
                          <tr key={o.id}>
                            <td data-label="ORDEN" className="order-id-cell">{o.order_ref || o.id}</td>
                            <td data-label="NOMBRE">{o.buyer?.name || '—'}</td>
                            <td data-label="DOC">{o.buyer?.doc || '—'}</td>
                            <td data-label="EVENTO">{mainItem?.eventName || o.items?.map(i => i.eventName).join(', ') || '—'}</td>
                            <td data-label="CANT" className="qty-cell">{o.items?.reduce((s, i) => s + i.qty, 0)}</td>
                            <td data-label="MÉTODO">
                              <span className={`method-badge method-${o.method}`}>
                                {o.method}
                              </span>
                            </td>
                            <td data-label="TOTAL" className="total-cell">
                              {formatCOP(o.total_amount || 0)}
                            </td>
                            <td data-label="FECHA" className="date-cell">
                              {new Date(o.createdAt || Date.now()).toLocaleString('es-CO', {
                                day: '2-digit', month: '2-digit',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </td>
                            <td data-label="ACCIONES">
                              <button 
                                onClick={() => handleDeleteOrder(o.id)}
                                style={{ background: '#ff3333', color: 'white', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Eliminar
                              </button>
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

        {/* ─── TAB 3: ESCANEAR ─── */}
        {tab === 3 && (
          <div className="admin-section">
            <h2 className="admin-section-title">Escanear Códigos QR</h2>
            <QRScanner pin={token} />
          </div>
        )}

        {/* ─── TAB 4: COMPRADORES (CRM) ─── */}
        {tab === 4 && (
          <div className="admin-section">
            <div className="admin-list-header">
              <h2 className="admin-section-title" style={{ margin: 0 }}>
                Directorio de Compradores
                <span className="admin-count">{filteredBuyers.length}</span>
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="admin-filter-select" 
                  placeholder="Buscar (nombre, email, doc)..." 
                  value={buyerSearch}
                  onChange={e => setBuyerSearch(e.target.value)}
                />
                <button className="admin-btn-primary" onClick={() => openBuyerModal()} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                  + NUEVO
                </button>
              </div>
            </div>

            {filteredBuyers.length === 0 ? (
              <p className="admin-empty">No hay compradores registrados.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NOMBRE</th>
                      <th>DOCUMENTO</th>
                      <th>EMAIL</th>
                      <th>TELÉFONO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuyers.map(b => (
                      <tr key={b.id}>
                        <td data-label="ID" className="order-id-cell">{b.id}</td>
                        <td data-label="NOMBRE">{b.name || '—'}</td>
                        <td data-label="DOCUMENTO">{b.doc_type} {b.doc || '—'}</td>
                        <td data-label="EMAIL">{b.email || '—'}</td>
                        <td data-label="TELÉFONO">{b.phone}</td>
                        <td data-label="ACCIONES">
                          <button className="admin-btn-edit" onClick={() => openBuyerModal(b)}>Editar</button>
                          <button className="admin-btn-delete" onClick={() => handleDeleteBuyer(b.id)}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 5: ESTRATEGIA SELVÁTICA ─── */}
        {tab === 5 && (
          <StrategyDashboard />
        )}
      </div>

      {/* ─── MODAL COMPRADOR ─── */}
      {buyerModalOpen && (
        <div className="buyer-modal-overlay">
          <div className="buyer-modal">
            <h3>{buyerForm.id ? 'Editar Comprador' : 'Nuevo Comprador'}</h3>
            <form onSubmit={saveBuyer}>
              <div className="af-grid">
                <div className="af-field">
                  <label>Nombre</label>
                  <input name="name" value={buyerForm.name} onChange={handleBuyerForm} />
                </div>
                <div className="af-field">
                  <label>Tipo Doc</label>
                  <select name="doc_type" value={buyerForm.doc_type} onChange={handleBuyerForm}>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                </div>
                <div className="af-field">
                  <label>Documento</label>
                  <input name="doc" value={buyerForm.doc} onChange={handleBuyerForm} />
                </div>
                <div className="af-field">
                  <label>Teléfono *</label>
                  <input name="phone" required value={buyerForm.phone} onChange={handleBuyerForm} />
                </div>
                <div className="af-field">
                  <label>Email</label>
                  <input name="email" type="email" value={buyerForm.email} onChange={handleBuyerForm} />
                </div>
              </div>
              {buyerErr && <p className="admin-error">{buyerErr}</p>}
              <div className="buyer-modal-actions">
                <button type="button" onClick={() => setBuyerModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
