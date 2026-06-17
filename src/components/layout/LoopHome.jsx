import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeParticles from '../ThreeParticles'
import AudioPlayer from '../AudioPlayer'
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

    const { addToCart } = useCart()
    const audioRef = useRef(null)

    useEffect(() => {
        const now = new Date()
        const upcoming = eventsData
            .map(e => ({ ...e, dateObj: new Date(e.date) }))
            .filter(e => e.dateObj >= now)
            .sort((a, b) => a.dateObj - b.dateObj)

        if (upcoming.length > 0) {
            setActiveEvent(upcoming[0])
            setTheme(upcoming[0].themeId)
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

    const handleSelectEvent = (event) => {
        setActiveEvent(event)
        setTheme(event.themeId)
        setTicketQty(1)
        setAddedFeedback(false)
    }

    const handleAddToCart = () => {
        addToCart(activeEvent, ticketQty)
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

            {/* Retro grid overlay */}
            <div className="grid-overlay-back" style={{ opacity: theme === 'selvatica' ? 0.04 : 0.02 }} />

            {/* Ambient bottom glow */}
            <div className="liquid-overlay" />

            {/* Scanline effect */}
            <div className="scanline-overlay" />

            <main className="landing-content">

                {/* ─── HERO ─── */}
                <section className="brand-hero-section">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="brand-glow-header"
                    >
                        <span className="brand-badge">
                            <span className="badge-dot" /> FLORENCIA — ESCENA ELECTRÓNICA RADICAL
                        </span>

                        <h1 className="brand-main-title" data-glitch="LOOP.RAVE">
                            LOOP.RAVE
                        </h1>

                        {/* Acid spines decoration */}
                        <div className="acid-spines-row">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="acid-spine" style={{ '--i': i }} />
                            ))}
                        </div>

                        <p className="brand-manifesto">
                            No somos solo una fiesta. Somos el espacio que le hacía falta a Florencia —
                            donde el baile es un acto político, el sudor es colectivo y la música
                            electrónica se vuelve ritual. Raros, diversos, radicalmente libres.
                        </p>

                        <motion.button
                            onClick={toggleRaveMode}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`rave-btn-hook ${raveMode ? 'active' : ''}`}
                        >
                            <span className="rave-icon">{raveMode ? '◉' : '○'}</span>
                            {raveMode ? 'MODO RAVE ACTIVO — SINTIENDO EL BEAT' : 'ACTIVAR MODO RAVE'}
                        </motion.button>
                    </motion.div>
                </section>

                {/* ─── PRÓXIMO EVENTO SPOTLIGHT ─── */}
                <section className="active-event-spotlight">
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

                                <h2 className="spotlight-title">{activeEvent.name}</h2>

                                <p className="spotlight-desc">{activeEvent.description}</p>

                                {/* Date / Venue / Countdown grid */}
                                <div className="event-time-grid">
                                    <div className="time-tile">
                                        <span className="tile-label">CUÁNDO</span>
                                        <span className="tile-value">{activeEvent.dateDisplay}</span>
                                        <span className="tile-label-sub">{activeEvent.timeDisplay}</span>
                                    </div>
                                    <div className="time-tile">
                                        <span className="tile-label">DÓNDE</span>
                                        <span className="tile-value venue-secret">
                                            {activeEvent.venue}
                                            <span className="secret-badge">SECRET</span>
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

                                {/* Ticket CTA */}
                                <div className="ticket-purchase-box">
                                    <div className="ticket-details">
                                        <span className="price-label">{activeEvent.priceLabel}</span>
                                        <span className="price-tag">{activeEvent.priceDisplay}</span>
                                        <span className="price-note">Cupos limitados. Sin sorpresas.</span>
                                    </div>
                                    <div className="ticket-qty-row">
                                        {/* WhatsApp CTA — temporal mientras se habilita la pasarela de pagos */}
                                        <a
                                            href={activeEvent.ticketUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="buy-ticket-btn"
                                        >
                                            COMPRAR ENTRADA →
                                        </a>
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

                {/* ─── MERCH ─── */}
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

                {/* ─── EDITORIAL ─── */}
                <section className="blog-editorial-section">
                    <h3 className="section-title"><span>DESDE LA PISTA</span></h3>
                    <p className="section-intro-text">
                        Textos, podcasts y conversaciones sobre la escena que estamos construyendo.
                    </p>
                    <div className="blog-posts-grid">
                        <div className="blog-card-preview">
                            <span className="post-tag">CULTURA</span>
                            <span className="post-date">10.JUNIO.2026</span>
                            <h4>El techno como acto político en el Caquetá</h4>
                            <p>
                                Bailar aquí no es escapar. Es insistir. Es decir que existimos, que
                                somos raros y libres y que la cultura electrónica también es nuestra.
                            </p>
                            <span className="read-more">LEER ↗</span>
                        </div>
                        <div className="blog-card-preview">
                            <span className="post-tag">PODCAST</span>
                            <span className="post-date">02.JUNIO.2026</span>
                            <h4>LOOP #04 — Krubim: hipnosis en vivo</h4>
                            <p>
                                Ángel se sentó con su setup, cerró los ojos y dejó que la máquina
                                hablara. Grabamos todo. Escucha este set y entiende de qué va esto.
                            </p>
                            <span className="read-more">ESCUCHAR ↗</span>
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
        </div>
    )
}

export default LoopHome
