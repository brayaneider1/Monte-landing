import './Home.css'

function Home({ onNavigate }) {
    return (
        <div className="home">
            <div className="home-content">
                <div className="spiral-container">
                    <div className="spiral"></div>
                    <div className="leaf leaf-1">🍃</div>
                    <div className="leaf leaf-2">🍃</div>
                    <div className="leaf leaf-3">🍃</div>
                </div>

                <h1 className="home-title">MONTE</h1>

                <p className="home-date">18 de octubre</p>

                <div className="home-buttons">
                    <button
                        className="nav-button-concept"
                        onClick={() => onNavigate('concept')}
                    >
                        CONCEPTO
                    </button>

                    <button
                        className="nav-button-artists"
                        onClick={() => onNavigate('artists')}
                    >
                        ARTISTAS
                    </button>
                </div>

                <div className="home-footer">
                    <p className="sound-label">Sound AMBIENT</p>
                </div>
            </div>
        </div>
    )
}

export default Home
