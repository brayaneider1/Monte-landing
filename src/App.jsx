import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SafaeraHome from './components/SafaeraHome'
import Sponsors from './components/Sponsors'
import './App.css'

function App() {

  return (
    <Router>
      <div className="app">
        <Navbar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<SafaeraHome />} />
            <Route path="/sponsors" element={<Sponsors />} />
          </Routes>
        </div>


      </div>
    </Router>
  )
}

export default App
