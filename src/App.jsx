import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import LoopHome from './components/layout/LoopHome'
import Sponsors from './components/Sponsors'
import AdminPanel from './pages/AdminPanel'
import CartWidget from './components/cart/CartWidget'
import './App.css'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Navbar />

          <div className="main-content">
            <Routes>
              <Route path="/"        element={<LoopHome />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/admin"   element={<AdminPanel />} />
            </Routes>
          </div>

          {/* Floating cart widget — visible on all routes except admin */}
          <CartWidget />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
