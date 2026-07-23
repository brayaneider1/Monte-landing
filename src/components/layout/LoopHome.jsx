import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeParticles from '../ThreeParticles'
import AudioPlayer from '../AudioPlayer'
import CheckoutModal from '../CheckoutModal'
import WelcomeModal from '../WelcomeModal'
import { useCart } from '../../context/CartContext'
import eventsData from '../../data/events.json'
import './LoopHome.css'

function LoopHome() {
    const [events] = useState(eventsData)
    const [activeEvent, setActiveEvent] = useState(eventsData[0])
    const [theme, setTheme] = useState('selvatica')
    const [isPlaying, setIsPlaying] = useState(false)
    const [raveMode, setRaveMode] = useState(false)
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [ticketQty, setTicketQty] = useState(1)
    const [addedFeedback, setAddedFeedback] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [discountCode, setDiscountCode] = useState('')
    const [showWelcomeModal, setShowWelcomeModal] = useState(false)

    const { addToCart } = useCart()
    const audioRef = useRef(null)

    useEffect(() => {
        if (activeEvent && activeEvent.ticketOptions && activeEvent.ticketOptions.length > 0) {
            setSelectedOption(activeEvent.ticketOptions[0])
        } else {
            setSelectedOption(null)
        }
    }, [activeEvent])

    useEffect(() => {
        // Capturar usuario de Instagram o referido de la URL
        const params = new URLSearchParams(window.location.search)
        const ig = params.get('ig') || params.get('ref')
        if (ig) {
            sessionStorage.setItem('instagram_username', ig)
        }

        const now = new Date()
        const upcoming = eventsData
            .map(e => ({ ...e, dateObj: new Date(e.date) }))
            .filter(e => e.dateObj >= now)
            .sort((a, b) => a.dateObj - b.dateObj)

        if (upcoming.length > 0) {
            setActiveEvent(upcoming[0])
            setTheme(upcoming[0].themeId)
        }

        if (!sessionStorage.getItem('loop_lead_phone')) {
            setTimeout(() => {
                setShowWelcomeModal(true)
            }, 800)
        }
    }, [])

    useEffect(() => {
        document.body.setAttribute('data-theme', theme)
        raveMode
            ? document.body.classList.add('rave-flash')
            : document.body.classList.remove('rave-flash')
    }, [theme, raveMode])

    useEffect(() => {
        const timer = setInterval(() => {
            const diff = new Date(activeEvent.date).getTime() - Date.now()
            if (diff < 0) { clearInterval(timer); return }
            setCountdown({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [activeEvent])

    // (Social proof toasts removed — they were fake and caused unnecessary re-renders)

    const handleSelectEvent = (event) => {
        setActiveEvent(event)
        setTheme(event.themeId)
        setTicketQty(1)
        setAddedFeedback(false)
    }

    const handleAddToCart = () => {
        addToCart(activeEvent, selectedOption, ticketQty)
        setAddedFeedback(true)
        setTimeout(() => setAddedFeedback(false), 2000)
    }

    const toggleRaveMode = () => {
        const next = !raveMode
        setRaveMode(next)
        if (next && audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
        }
    }

    return (
        <div className={`loop-container theme-${theme}`}>
            <ThreeParticles audioRef={audioRef} isPlaying={isPlaying || raveMode} theme={theme} />

            {/* Noise texture layer */}
            <div className="noise-layer" />
            <div className="grid-overlay-back" style={{ opacity: theme === 'selvatica' ? 0.04 : 0.02 }} />
            <div className="liquid-overlay" />
            <div className="scanline-overlay" />

            <main className="landing-content">

                {/* ─── HERO — PIEZA GRÁFICA ─── */}
                <section className="brand-hero-section">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="brand-glow-header"
                    >
                        {/* Top label */}
                        <span className="brand-badge">
                            <span className="badge-dot" /> FLORENCIA, CAQUETÁ — 08.AGO.2026
                        </span>

                        {/* Main title */}
                        <h1 className="brand-main-title" data-glitch="LOOP.RAVE">LOOP.RAVE</h1>

                        {/* Subtitle */}
                        <p className="brand-subtitle">SELVÁTICA</p>

                        {/* Divider */}
                        <div className="hero-divider">
                            <span className="divider-line" />
                            <span className="divider-icon">🌿</span>
                            <span className="divider-line" />
                        </div>

                        {/* VENUE — PROTAGONISTA */}
                        <motion.div
                            className="hero-venue-block"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <span className="venue-eyebrow">📍 LUGAR DEL EVENTO</span>
                            <h2 className="venue-name-hero">CENTRO RECREACIONAL<br />YURUPARI</h2>
                            <span className="venue-location-tag">Florencia · Caquetá · Colombia</span>
                        </motion.div>

                        {/* Lineup preview */}
                        <motion.div
                            className="hero-lineup-preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <span className="lineup-label">LINEUP</span>
                            <div className="hero-artists-row">
                                <span>DIVALAO</span>
                                <span className="dot-sep">·</span>
                                <span>OMNICLOUD</span>
                                <span className="dot-sep">·</span>
                                <span>OBA ILU</span>
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <div className="hero-cta-wrapper">
                            <motion.button
                                onClick={() => {
                                    const section = document.getElementById('tickets-section');
                                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hero-cta-btn"
                            >
                                🎟 COMPRAR ENTRADAS
                            </motion.button>
                        </div>
                    </motion.div>
                </section>

                {/* ─── PRÓXIMO EVENTO SPOTLIGHT ─── */}
                <section className="active-event-spotlight" id="tickets-section">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeEvent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className={`event-card-spotlight spotlight-${activeEvent.id}`}
                        >
                            {/* Corner brackets */}
                            <div className="tech-corner top-left" />
                            <div className="tech-corner top-right" />
                            <div className="tech-corner bottom-left" />
                            <div className="tech-corner bottom-right" />

                            {activeEvent.id === 'selvatica' && (
                                <>
                                    <div className="selvatica-tribal tribal-top-right">
                                        <svg viewBox="0 0 100 100" fill="none" stroke="var(--theme-secondary)" strokeWidth="1.2">
                                            <path d="M10 0 C 30 15, 60 5, 80 40 C 90 55, 95 30, 100 50 C 95 65, 80 75, 70 60 C 50 40, 60 80, 20 90 C 15 95, 25 80, 10 70 C -5 60, 5 40, 25 40 C 40 40, 20 20, 10 0 Z" fill="rgba(0, 191, 255, 0.03)" />
                                            <path d="M25 40 C 35 45, 45 35, 40 25 C 30 20, 20 30, 25 40 Z" fill="var(--theme-bg)" />
                                        </svg>
                                    </div>
                                    <div className="selvatica-tribal tribal-bottom-left">
                                        <svg viewBox="0 0 100 100" fill="none" stroke="var(--theme-secondary)" strokeWidth="1.2" style={{ transform: 'rotate(180deg)' }}>
                                            <path d="M10 0 C 30 15, 60 5, 80 40 C 90 55, 95 30, 100 50 C 95 65, 80 75, 70 60 C 50 40, 60 80, 20 90 C 15 95, 25 80, 10 70 C -5 60, 5 40, 25 40 C 40 40, 20 20, 10 0 Z" fill="rgba(0, 191, 255, 0.03)" />
                                            <path d="M25 40 C 35 45, 45 35, 40 25 C 30 20, 20 30, 25 40 Z" fill="var(--theme-bg)" />
                                        </svg>
                                    </div>
                                </>
                            )}

                            {/* System metadata bar */}
                            <div className="technical-metadata">
                                <span>SYS // LOOP.RAVE PORTAL v2.6</span>
                                <span className="blink-dot">● LIVE</span>
                            </div>

                            <div className="spotlight-body">
                                <div className="event-header-row">
                                    <span className="event-pill">{activeEvent.tagline}</span>
                                    {activeEvent.id === 'selvatica' && (
                                        <div className="selvatica-butterfly-visual">
                                            <svg className="morpho-svg" viewBox="0 0 100 100">
                                                <path className="wing left-wing" d="M50 50 C20 20, 5 35, 12 62 C17 82, 42 72, 50 65" />
                                                <path className="wing right-wing" d="M50 50 C80 20, 95 35, 88 62 C83 82, 58 72, 50 65" />
                                                <line x1="50" y1="44" x2="50" y2="72" strokeWidth="2.5" />
                                                <circle cx="50" cy="41" r="3" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <h2 className="spotlight-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{activeEvent.name}</h2>
                                <p className="spotlight-desc" style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                                    Experiencia inmersiva en el piedemonte.
                                </p>

                                {/* Date / Venue / Countdown grid */}
                                <div className="event-time-grid">
                                    <div className="time-tile">
                                        <span className="tile-label">CUÁNDO</span>
                                        <span className="tile-value">{activeEvent.dateDisplay}</span>
                                        <span className="tile-label-sub">{activeEvent.timeDisplay}</span>
                                    </div>
                                    <div className="time-tile venue-tile-hero">
                                        <span className="tile-label">📍 LUGAR</span>
                                        <span className="tile-value venue-confirmed">
                                            {activeEvent.venue}
                                        </span>
                                        <span className="tile-label-sub">{activeEvent.location}</span>
                                    </div>
                                    <div className="time-tile countdown-tile">
                                        <span className="tile-label">FALTAN</span>
                                        <div className="countdown-timer">
                                            {[
                                                [countdown.days, 'DÍAS'],
                                                [countdown.hours, 'HRS'],
                                                [countdown.minutes, 'MIN'],
                                                [countdown.seconds, 'SEG'],
                                            ].map(([val, label]) => (
                                                <div key={label} className="c-item">
                                                    <span>{String(val).padStart(2, '0')}</span>
                                                    <small>{label}</small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* What's happening */}
                                <div className="lineup-spotlight-section">
                                    <h4 className="technical-sub">// QUÉ VA A PASAR</h4>
                                    <div className="artists-chips">
                                        {activeEvent.lineup.map((item, i) => (
                                            <div key={i} className="artist-chip">
                                                <span className="chip-cat">{item.category}</span>
                                                <span className="chip-name">{item.name}</span>
                                                <span className="chip-genre">{item.genre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ticket Options / Combos Selector */}
                                {activeEvent.ticketOptions && (
                                    <div className="ticket-options-section">
                                        <h4 className="technical-sub">// SELECCIONA TU ENTRADA / COMBO</h4>
                                        
                                        {/* FOMO Bar */}
                                        <div className="fomo-bar-container" style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--neon-green)', fontFamily: 'Inter, monospace', marginBottom: '5px' }}>
                                                <span>ESTADO: ETAPA 1</span>
                                                <span className="blink">85% VENDIDO</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(0,255,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '85%' }}
                                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                                    style={{ height: '100%', background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="ticket-options-grid">
                                            {activeEvent.ticketOptions
                                                .filter(opt => opt.id !== 'prueba_wompi' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === '1'))
                                                .map((opt) => (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => setSelectedOption(opt)}
                                                    className={`ticket-option-card ${selectedOption?.id === opt.id ? 'active' : ''}`}
                                                >
                                                    <div className="option-radio-indicator">
                                                        <div className="radio-dot" />
                                                    </div>
                                                    <div className="option-info-text">
                                                        <span className="option-title-text">{opt.name}</span>
                                                        <span className="option-desc-text">{opt.description}</span>
                                                    </div>
                                                    <span className="option-price-tag">{opt.priceDisplay}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ticket CTA */}
                                <div className="ticket-purchase-box" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--neon-green)', marginTop: '2rem' }}>
                                    <div className="ticket-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            TOTAL
                                        </span>
                                        <div className="price-tag-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="price-tag" style={{ color: 'var(--neon-green)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                ${((selectedOption ? selectedOption.price : activeEvent.price) * ticketQty).toLocaleString()} COP
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ticket-qty-row" style={{ display: 'flex', gap: '15px' }}>
                                        {/* Quantity control */}
                                        <div className="ticket-qty-ctrl" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--neon-green)', padding: '0.5rem', borderRadius: '4px' }}>
                                            <button type="button" onClick={() => setTicketQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', color: 'var(--neon-green)', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>−</button>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{ticketQty}</span>
                                            <button type="button" onClick={() => setTicketQty(q => q + 1)} style={{ background: 'none', border: 'none', color: 'var(--neon-green)', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>+</button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsCheckoutOpen(true)}
                                            className="buy-ticket-btn"
                                            style={{ flex: 1, background: 'var(--neon-green)', color: '#fff', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            ADQUIRIR AHORA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* ─── CAMBIAR EVENTO ─── */}
                <section className="events-browser-grid">
                    <h3 className="section-title">
                        <span>PRÓXIMAS CITAS</span>
                    </h3>
                    <p className="section-intro-text">
                        Cada evento es su propio universo. Cambia de dimensión y descubre qué viene.
                    </p>
                    <div className="browser-cards">
                        {events.map((e) => {
                            const isSelected = e.id === activeEvent.id
                            return (
                                <motion.div
                                    key={e.id}
                                    onClick={() => handleSelectEvent(e)}
                                    whileTap={{ scale: 0.97 }}
                                    className={`browser-card ${isSelected ? 'active' : ''}`}
                                >
                                    <div className="card-selection-indicator" />
                                    <span className="browser-date">{e.dateDisplay}</span>
                                    <h4 className="browser-name">{e.name}</h4>
                                    <span className="browser-venue">{e.venue} · {e.location}</span>
                                    <div className="browser-price-info">
                                        Desde <strong>{e.priceDisplay}</strong>
                                    </div>
                                    <div className="browser-select-btn">
                                        {isSelected ? '◉ EN PANTALLA' : '○ VER ESTE'}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* ─── MERCH (Hidden for now) ───
                <section className="merch-preview-section">
                    <h3 className="section-title"><span>LOOP.WARE</span></h3>
                    <p className="section-intro-text">
                        Ropa de gente que baila. Cortes oversized, telas que aguantan la noche
                        y gráficos que hablan por sí solos. Colección de lanzamiento — muy poquito stock.
                    </p>
                    <div className="merch-items-grid">
                        {[
                            { tag: 'LIMITED', icon: '◫', name: 'CAMISETA OVERSIZED', sub: 'Serigrafía LOOP en negro', price: '$45.000', link: 'Camiseta%20Oversized%20LOOP' },
                            { tag: 'HOT', icon: '△', name: 'GORRA ACID SPIKE', sub: 'Dri-fit con bordado frontal', price: '$35.000', link: 'Gorra%20Acid%20Spike' },
                            { tag: null, icon: '◈', name: 'STICKER PACK', sub: '6 stickers holográficos', price: '$10.000', link: 'Sticker%20Pack' },
                        ].map((item) => (
                            <div key={item.name} className="merch-item-card">
                                <div className="item-image-wrapper">
                                    {item.tag && <span className="merch-tag">{item.tag}</span>}
                                    <div className="item-icon-graphic">{item.icon}</div>
                                </div>
                                <div className="item-info">
                                    <h5>{item.name}</h5>
                                    <p className="item-sub">{item.sub}</p>
                                    <span className="item-price">{item.price} COP</span>
                                    <a
                                        href={`https://wa.me/573124524674?text=Hola!%20Quiero%20info%20sobre%20${item.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="merch-order-link"
                                    >
                                        QUIERO ESTO →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                */}

                {/* ─── EDITORIAL / MANIFIESTO ─── */}
                <section className="blog-editorial-section">
                    <h3 className="section-title"><span>EL MANIFIESTO</span></h3>
                    <p className="section-intro-text">
                        Nuestra declaración de intenciones.
                    </p>
                    <div className="blog-posts-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="blog-card-preview" style={{ padding: '2rem', textAlign: 'center' }}>
                            <h4 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Estamos cansados de ser oyentes, de reproducir identidades ajenas que responden a lo absurdo del consumo rápido, el cual carece de autenticidad y nos obliga a resistir las consecuencias en el avance de la creación y la consolidación de una comunidad real que se nutre y celebra.
                            </h4>
                        </div>
                    </div>
                </section>

            </main>

            {/* ─── RADIO WIDGET (self-positioned fixed bottom-right) ─── */}
            <AudioPlayer
                ref={audioRef}
                onPlayingChange={(playing) => setIsPlaying(playing)}
            />

            {/* ─── FOOTER ─── */}
            <footer className="ambient-footer">
                <div className="footer-loop-mark">LOOP.RAVE</div>
                <p>Hecho en Florencia, Caquetá. Con cariño y mucho reverb.</p>
                <div className="footer-links">
                    <a href="https://www.instagram.com/loop.rave/" target="_blank" rel="noopener noreferrer">IG</a>
                    <a href="https://web.facebook.com/people/LOOP-RAVE/61557024395105/" target="_blank" rel="noopener noreferrer">FB</a>
                    <a href="https://www.youtube.com/channel/UCpI4xm94uFPEYmapRp3z6ow" target="_blank" rel="noopener noreferrer">YT</a>
                </div>
                <span className="footer-copy">© 2026 LOOP.RAVE — Derechos de pista reservados</span>
            </footer>

            {/* Toast eliminado — era notificación falsa de bot */}

            <CheckoutModal 
                isOpen={isCheckoutOpen} 
                onClose={() => setIsCheckoutOpen(false)}
                selectedOption={selectedOption}
                event={activeEvent}
                ticketQty={ticketQty}
            />

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
            />
        </div>
    )
}

export default LoopHome
