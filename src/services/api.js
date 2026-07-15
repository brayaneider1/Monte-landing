/**
 * API Service Layer — LOOP.RAVE Ticketing
 *
 * If VITE_API_URL is set in .env → real FastAPI calls
 * Otherwise → localStorage mock (for frontend-only dev)
 */

const RAW_BASE = import.meta.env.VITE_API_URL || null
const BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, '') : null

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

// ── ADMIN: BUYERS CRUD (CRM) ──────────────────────────────────

export async function getBuyers(pin) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/buyers`, {
      headers: { 'X-Admin-Pin': pin },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  }
  return [] // Mock no implementado para buyers
}

export async function createBuyer(buyer, pin) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': pin },
      body: JSON.stringify(buyer),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API error ${res.status}`)
    }
    return res.json()
  }
  return { id: Date.now(), ...buyer }
}

export async function updateBuyer(id, buyer, pin) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/buyers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': pin },
      body: JSON.stringify(buyer),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API error ${res.status}`)
    }
    return res.json()
  }
  return { id, ...buyer }
}

export async function deleteBuyer(id, pin) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/buyers/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Pin': pin },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API error ${res.status}`)
    }
    return res.json()
  }
  return { success: true }
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

// ── ADMIN: CHECK-IN ORDER (QR SCANNER) ────────────────────────

export async function checkInOrder(orderRef, pin) {
  if (BASE) {
    const res = await fetch(`${BASE}/api/admin/orders/${orderRef}/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pin}`, 
        'X-Admin-Pin': pin,
      },
    })
    
    // Si no es 2xx, extraer mensaje de error del backend
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || `Error al verificar orden (${res.status})`)
    }
    
    return res.json()
  }

  // MOCK PARA DESARROLLO LOCAL
  await fakeDelay(400)
  const orders = getMockOrders()
  const orderIndex = orders.findIndex(o => o.id === orderRef || o.order_ref === orderRef)
  
  if (orderIndex === -1) throw new Error("Orden no encontrada en base local")
  
  const order = orders[orderIndex]
  
  if (order.is_checked_in) {
    throw new Error("ALERTA: Este ticket ya fue usado previamente")
  }
  
  orders[orderIndex].is_checked_in = true
  saveMockOrders(orders)
  
  const ticketsCount = order.items?.reduce((acc, it) => acc + (it.qty || 1), 0) || 1
  return {
    success: true,
    message: `Ingreso Exitoso (${ticketsCount} personas)`,
    buyer_name: order.buyer?.name || 'Comprador Local',
    tickets_count: ticketsCount
  }
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
