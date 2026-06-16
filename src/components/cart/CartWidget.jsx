import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import CheckoutModal from './CheckoutModal'
import './CartWidget.css'

export default function CartWidget() {
  const { totalItems, totalPrice } = useCart()
  const [open, setOpen] = useState(false)

  if (totalItems === 0) return null

  return (
    <>
      <motion.button
        className="cart-widget"
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={`Ver carrito — ${totalItems} entradas`}
      >
        <span className="cart-icon">🎟</span>
        <span className="cart-badge">{totalItems}</span>
        <div className="cart-label">
          <span className="cart-label-title">MI CARRITO</span>
          <span className="cart-label-total">
            {new Intl.NumberFormat('es-CO', {
              style: 'currency', currency: 'COP', maximumFractionDigits: 0,
            }).format(totalPrice)}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && <CheckoutModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
