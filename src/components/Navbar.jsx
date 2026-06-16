import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
    const location = useLocation()
    const isAdmin  = location.pathname === '/admin'

    // Show admin link only on localhost or when ?admin=1 is in the URL
    const showAdminLink = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         new URLSearchParams(window.location.search).get('admin') === '1')

    // Hide navbar entirely on admin panel
    if (isAdmin) return null

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">LOOP.RAVE</Link>
            </div>
            <div className="navbar-links">
                <Link
                    to="/"
                    className={location.pathname === '/' ? 'active' : ''}
                >
                    INICIO
                </Link>
                <Link
                    to="/sponsors"
                    className={location.pathname === '/sponsors' ? 'active' : ''}
                >
                    SPONSORS
                </Link>
                {showAdminLink && (
                    <Link
                        to="/admin"
                        className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    >
                        ADMIN
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar

