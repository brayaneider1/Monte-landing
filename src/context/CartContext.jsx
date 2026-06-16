import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{ eventId, eventName, priceUnit, priceDisplay, qty }]

  const addToCart = useCallback((event, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.eventId === event.id)
      if (existing) {
        return prev.map(i =>
          i.eventId === event.id ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, {
        eventId: event.id,
        eventName: event.name,
        priceUnit: event.price,
        priceDisplay: event.priceDisplay,
        qty,
      }]
    })
  }, [])

  const updateQty = useCallback((eventId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.eventId !== eventId))
    } else {
      setItems(prev => prev.map(i => i.eventId === eventId ? { ...i, qty } : i))
    }
  }, [])

  const removeFromCart = useCallback((eventId) => {
    setItems(prev => prev.filter(i => i.eventId !== eventId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + i.qty * i.priceUnit, 0)

  return (
    <CartContext.Provider value={{
      items, addToCart, updateQty, removeFromCart, clearCart,
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
