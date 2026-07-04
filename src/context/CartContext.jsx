import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{ eventId, eventName, priceUnit, priceDisplay, qty }]

  const addToCart = useCallback((event, option = null, qty = 1) => {
    const optionId = option ? option.id : 'default'
    const key = `${event.id}_${optionId}`
    const priceUnit = option ? option.price : event.price
    const priceDisplay = option ? option.priceDisplay : event.priceDisplay
    const eventName = option 
      ? `${event.name} — ${option.name}`
      : event.name

    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, {
        key,
        eventId: event.id,
        optionId,
        eventName,
        priceUnit,
        priceDisplay,
        qty,
      }]
    })
  }, [])

  const updateQty = useCallback((key, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.key !== key))
    } else {
      setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
    }
  }, [])

  const removeFromCart = useCallback((key) => {
    setItems(prev => prev.filter(i => i.key !== key))
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
