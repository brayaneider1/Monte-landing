import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
    const location = useLocation()

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">SAFAERA</Link>
            </div>
            <div className="navbar-links">
                <Link
                    to="/"
                    className={location.pathname === '/' ? 'active' : ''}
                >
                    INICIO
                </Link>
            </div>
        </nav>
    )
}

export default Navbar
