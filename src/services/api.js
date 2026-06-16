/**
 * API Service Layer — LOOP.RAVE Ticketing
 *
 * If VITE_API_URL is set in .env → real FastAPI calls
 * Otherwise → localStorage mock (for frontend-only dev)
 */

const BASE = import.meta.env.VITE_API_URL || null

// ── MOCK STORAGE HELPERS ──────────────────────────────────────

function getMockOrders() {
  try { return JSON.parse(localStorage.getItem('loop_orders') || '[]') } catch { return [] }
}
function saveMockOrders(orders) {
  localStorage.setItem('loop_orders', JSON.stringify(orders))
}
function nextId() {
  return 'LR-' + Date.now().toString(36).toUpperCase()
}

// ── PUBLIC: CREATE ORDER (checkout) ──────────────────────────

export async function createOrder({ buyer, items }) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyer, items }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  }

  // MOCK
  await fakeDelay(600)
  const order = {
    id: nextId(),
    buyer,
    items,
    method: 'online',
    status: 'pending_payment',
    createdAt: new Date().toISOString(),
  }
  const orders = getMockOrders()
  orders.push(order)
  saveMockOrders(orders)
  return order
}

// ── ADMIN: GET ORDERS ─────────────────────────────────────────

export async function getOrders(pin) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/orders`, {
      headers: { 'X-Admin-Pin': pin },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  }

  // MOCK
  await fakeDelay(300)
  return getMockOrders()
}

// ── ADMIN: REGISTER MANUAL SALE ───────────────────────────────

export async function registerManualSale({ buyer, items, method, pin }) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/manual-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Pin': pin,
      },
      body: JSON.stringify({ buyer, items, method }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  }

  // MOCK
  await fakeDelay(400)
  const order = {
    id: nextId(),
    buyer,
    items,
    method,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  const orders = getMockOrders()
  orders.push(order)
  saveMockOrders(orders)
  return order
}

// ── ADMIN: CLEAR ALL ORDERS (dev helper) ─────────────────────

export function clearMockOrders() {
  localStorage.removeItem('loop_orders')
}

// ── UTILS ─────────────────────────────────────────────────────

function fakeDelay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(amount)
}
