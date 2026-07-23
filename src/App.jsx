import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import LoopHome from './components/layout/LoopHome'
import CartWidget from './components/cart/CartWidget'
import './App.css'

// Lazy-loaded routes — only downloaded when user navigates there
const Sponsors   = lazy(() => import('./components/Sponsors'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Navbar />

          <div className="main-content">
            <Suspense fallback={null}>
              <Routes>
                <Route path="/"        element={<LoopHome />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/admin"   element={<AdminPanel />} />
              </Routes>
            </Suspense>
          </div>

          {/* Floating cart widget — visible on all routes except admin */}
          <CartWidget />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
