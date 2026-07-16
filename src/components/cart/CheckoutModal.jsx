import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { createOrder, formatCOP } from '../../services/api'
import eventsData from '../../data/events.json'
import './CheckoutModal.css'

const STEPS = ['RESUMEN', 'TUS DATOS', 'PAGO']

export default function CheckoutModal({ onClose }) {
  const { items, updateQty, removeFromCart, totalItems, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [order, setOrder]   = useState(null)

  const [buyer, setBuyer] = useState({
    name: '', doc: '', email: '', phone: '',
    instagram: sessionStorage.getItem('instagram_username') || '',
  })

  const handleBuyerChange = (e) => {
    const val = e.target.name === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
    setBuyer(b => ({ ...b, [e.target.name]: val }));
  }

  const handlePhoneBlur = async () => {
    if (!buyer.phone) return
    try {
      const response = await fetch('https://loop-core-production.up.railway.app/api/v1/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: buyer.phone })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.buyer) {
          setBuyer(b => ({
            ...b,
            name: b.name || data.buyer.name || '',
            email: b.email || data.buyer.email || '',
            doc: b.doc || data.buyer.doc || '',
            instagram: b.instagram || data.buyer.instagram || '',
          }))
        }
      }
    } catch (err) {
      console.error("Error looking up buyer by phone in cart:", err)
    }
  }

  // ── Step 0 → 1
  const goToData = () => {
    if (items.length === 0) return
    setStep(1)
  }

  // ── Step 1 → 2
  const goToPayment = (e) => {
    e.preventDefault()
    if (!buyer.name || !buyer.doc || !buyer.email || !buyer.phone) {
      setError('Nombre, documento, correo y teléfono son obligatorios.')
      return
    }
    setError('')
    setStep(2)
  }

  // ── Step 2 → Confirm (mock or real)
  const handleConfirmPayment = async () => {
    setLoading(true)
    setError('')
    try {
      const firstItem = items[0]
      const event = eventsData.find(e => e.id === firstItem?.eventId)
      const eventSlug = event?.slug || 'selvatica-2026'

      const created = await createOrder({
        event_slug: eventSlug,
        buyer: {
          name: buyer.name,
          doc: buyer.doc,
          email: buyer.email,
          phone: buyer.phone,
          instagram: buyer.instagram ? buyer.instagram.trim() : null
        },
        items: items.map(i => ({
          ticket_type: i.optionId === 'default' ? 'general' : i.optionId,
          quantity: i.qty
        })),
        payment_method: "wompi"
      })
      setOrder(created)
      clearCart()
      setStep(3)
    } catch (err) {
      setError('Hubo un error al crear la orden. Intenta de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Wompi integration point
  // When you have the Wompi public key, replace handleConfirmPayment with:
  // const checkout = new WidgetCheckout({ ... }) checkout.open(...)
  // For now we proceed directly to "pending_payment" status.

  return (
    <motion.div
      className="checkout-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="checkout-panel"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div className="co-header">
          <div className="co-logo">LOOP.RAVE</div>
          {step < 3 && (
            <div className="co-steps">
              {STEPS.map((s, i) => (
                <span key={s} className={`co-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                  {i < step ? '✓' : i + 1} {s}
                </span>
              ))}
            </div>
          )}
          <button className="co-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="co-body">
          <AnimatePresence mode="wait">

            {/* ─── STEP 0: Resumen del carrito ─── */}
            {step === 0 && (
              <motion.div key="s0" className="co-step-content" {...slideAnim}>
                <h2 className="co-title">Tu carrito</h2>
                {items.length === 0
                  ? <p className="co-empty">No tienes entradas en el carrito.</p>
                  : items.map(item => (
                    <div key={item.key || item.eventId} className="co-item">
                      <div className="co-item-info">
                        <span className="co-item-name">{item.eventName}</span>
                        <span className="co-item-unit">{formatCOP(item.priceUnit)} c/u</span>
                      </div>
                      <div className="co-item-qty">
                        <button onClick={() => updateQty(item.key || item.eventId, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.key || item.eventId, item.qty + 1)}>+</button>
                      </div>
                      <div className="co-item-total">{formatCOP(item.qty * item.priceUnit)}</div>
                      <button className="co-item-remove" onClick={() => removeFromCart(item.key || item.eventId)}>×</button>
                    </div>
                  ))
                }
                {items.length > 0 && (
                  <div className="co-subtotal">
                    <span>{totalItems} entrada{totalItems !== 1 ? 's' : ''}</span>
                    <span className="co-total-price">{formatCOP(totalPrice)}</span>
                  </div>
                )}
                <div className="co-actions">
                  <button className="co-btn-ghost" onClick={onClose}>SEGUIR VIENDO</button>
                  <button className="co-btn-primary" onClick={goToData} disabled={items.length === 0}>
                    CONTINUAR →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 1: Datos del comprador ─── */}
            {step === 1 && (
              <motion.div key="s1" className="co-step-content" {...slideAnim}>
                <h2 className="co-title">¿Quién compra?</h2>
                <p className="co-subtitle">
                  Necesitamos estos datos para enviarte tu entrada y registrarte a la puerta.
                </p>
                <form className="co-form" onSubmit={goToPayment}>
                  <div className="co-field">
                    <label htmlFor="co-name">Nombre completo *</label>
                    <input
                      id="co-name"
                      name="name"
                      value={buyer.name}
                      onChange={handleBuyerChange}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div className="co-field">
                    <label htmlFor="co-doc">Cédula / Documento *</label>
                    <input
                      id="co-doc"
                      name="doc"
                      value={buyer.doc}
                      onChange={handleBuyerChange}
                      placeholder="Número de documento"
                      required
                    />
                  </div>
                  <div className="co-field">
                    <label htmlFor="co-email">Correo electrónico *</label>
                    <input
                      id="co-email"
                      name="email"
                      type="email"
                      value={buyer.email}
                      onChange={handleBuyerChange}
                      placeholder="tu@correo.com"
                      required
                    />
                  </div>
                   <div className="co-field">
                    <label htmlFor="co-phone">Teléfono *</label>
                    <input
                      id="co-phone"
                      name="phone"
                      type="tel"
                      value={buyer.phone}
                      onChange={handleBuyerChange}
                      onBlur={handlePhoneBlur}
                      placeholder="+57 300 000 0000"
                      required
                    />
                  </div>
                  <div className="co-field">
                    <label htmlFor="co-instagram">Usuario de Instagram <span className="optional">(opcional)</span></label>
                    <input
                      id="co-instagram"
                      name="instagram"
                      type="text"
                      value={buyer.instagram}
                      onChange={handleBuyerChange}
                      placeholder="Ej. @brayan_rave"
                    />
                  </div>
                  {error && <p className="co-error">{error}</p>}
                  <div className="co-actions">
                    <button type="button" className="co-btn-ghost" onClick={() => setStep(0)}>← ATRÁS</button>
                    <button type="submit" className="co-btn-primary">IR AL PAGO →</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 2: Pago ─── */}
            {step === 2 && (
              <motion.div key="s2" className="co-step-content" {...slideAnim}>
                <h2 className="co-title">Pago</h2>
                <div className="co-payment-summary">
                  <div className="co-ps-row">
                    <span>Comprador</span>
                    <span>{buyer.name}</span>
                  </div>
                  <div className="co-ps-row">
                    <span>Entradas</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="co-ps-row co-ps-total">
                    <span>Total</span>
                    <span>{formatCOP(totalPrice)}</span>
                  </div>
                </div>

                {/* ── WOMPI WIDGET MOUNT POINT ── */}
                <div className="wompi-placeholder">
                  <div className="wompi-badge">WOMPI · Pago seguro</div>
                  <p className="wompi-note">
                    Acepta tarjetas de crédito/débito, PSE, Nequi y Daviplata.
                    <br />
                    <span className="wompi-pending">
                      (Integración Wompi activa cuando el backend esté listo)
                    </span>
                  </p>
                  {/* Replace this button with: <script src="..."> Wompi widget </script> */}
                  <button
                    className="co-btn-primary wompi-btn"
                    onClick={handleConfirmPayment}
                    disabled={loading}
                  >
                    {loading ? 'PROCESANDO…' : `PAGAR ${formatCOP(totalPrice)} →`}
                  </button>
                </div>

                {error && <p className="co-error">{error}</p>}

                <div className="co-actions" style={{ marginTop: '12px' }}>
                  <button className="co-btn-ghost" onClick={() => setStep(1)}>← CAMBIAR DATOS</button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: Confirmación ─── */}
            {step === 3 && order && (
              <motion.div key="s3" className="co-step-content co-confirmed" {...slideAnim}>
                <div className="co-confirm-icon">✓</div>
                <h2 className="co-title">¡Orden creada!</h2>
                <p className="co-subtitle">
                  Tu número de orden es <strong>{order.id}</strong>.<br />
                  Recibirás la entrada en <strong>{buyer.email}</strong> cuando el pago sea confirmado.
                </p>
                <div className="co-order-detail">
                  <span className="cod-label">ESTADO</span>
                  <span className="cod-value">PENDIENTE DE PAGO</span>
                </div>
                <div className="co-order-detail">
                  <span className="cod-label">ORDEN</span>
                  <span className="cod-value co-order-id">{order.id}</span>
                </div>
                <p className="co-footer-note">
                  ¿Preguntas? Escríbenos en el IG{' '}
                  <a href="https://www.instagram.com/loop.rave/" target="_blank" rel="noopener noreferrer">
                    @loop.rave
                  </a>
                </p>
                <button className="co-btn-primary" onClick={onClose} style={{ marginTop: '24px' }}>
                  CERRAR
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

const slideAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
  transition: { duration: 0.22 },
}
