import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import ArtistModal from './ArtistModal'
import './SafaeraHome.css'

function SafaeraHome() {
    const [selectedArtist, setSelectedArtist] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const genres = [
        'Techno',
        'House',
        'Deep House',
        'Minimal Techno',
        'Melodic Techno',
        'Guaracha',
        'Dembow',
        'Tribal House',
        'Latin Club',
        'Progressive',
        'Hypnotic Groove',
        'Hard Groove'
    ]

    const artists = [
        {
            name: 'BRENDA B2B MARIA MANUELA',
            category: 'HEADLINER',
            genre: 'House / Groove / Melodic House',
            bio: 'Brenda & Maria Manuela son productoras y DJs colombianas que trabajan como un dúo comprometido a largo plazo. No son un back-to-back ocasional, sino una colaboración constante construida sobre autoría compartida, confianza y un diálogo permanente entre el DJing y la producción. Han desarrollado una práctica musical que fluye a través de territorios electrónicos mientras preserva un núcleo claro y reconocible. Su trabajo está impulsado por el contraste y la tensión: estructuras de techno de Detroit que encuentran el peso del dub de principios de los 2000, lógicas rítmicas caribeñas que colisionan con percusión sudafricana. Todo lo que tocan y producen es tratado con un enfoque riguroso hacia el diseño de sonido y una selección cuidadosa e intencional.',
            experience: '10+ años cada una dominando la escena house nacional e internacional',
            videoUrl: 'https://www.youtube.com/embed/sfHXoiLmThM',
            highlights: [
                'Dúo comprometido con autoría compartida y visión musical unificada',
                'Sets maratónicos de 6+ horas que han marcado la historia de la escena',
                'Fusión única de Detroit techno, dub, ritmos caribeños y percusión africana',
                'Enfoque riguroso en diseño de sonido y selección intencional',
                'Presentaciones en los festivales y clubs más importantes de Latinoamérica',
                'Producciones lanzadas en sellos europeos de renombre'
            ]
        },
        {
            name: 'KRUBIM',
            category: 'ARTISTA NACIONAL',
            genre: 'Techno / Hypnotic / Minimal',
            bio: 'Ángel Florián, conocido artísticamente como Krubim, es un productor y live act de Cali que a sus 23 años ha dedicado casi cinco años a desarrollar un sonido distintivo dentro del espectro techno. Su alias nace de una visión clara: expresar el ritmo y su esencia desde su propia perspectiva, moldeada por sus raíces afro y latinoamericanas. Su sonido es hipnótico, minimalista y profundo, combinando elementos percusivos rápidos con atmósferas emocionales y vocales cargadas de mensajes que invitan a la introspección, siempre estructurando una narrativa enfocada en la energía del dancefloor y la conexión colectiva. Debutó oficialmente en marzo de 2025 y desde entonces ha llevado su música a ciudades como Popayán, Pereira, Mocoa, Bogotá, Tunja y Pasto. Es fundador de Circuit Techno, proyecto dedicado a promover el talento local y fortalecer la cultura de música electrónica.',
            experience: 'Casi 5 años desarrollando su sonido techno hipnótico',
            videoUrl: 'https://www.youtube.com/embed/eKGwJX62JC0',
            highlights: [
                'Finalista en DJ Contest de ElectripRave Festival (Octubre 2024)',
                'Debut en Tunnel Club (Pereira), venue clave del techno nacional',
                'Fundador de Circuit Techno, promoviendo talento local',
                'Sonido hipnótico, minimalista y profundo con raíces afro-latinoamericanas',
                'Productor y live act con enfoque en narrativa de dancefloor',
                'Presentaciones en Popayán, Pereira, Mocoa, Bogotá, Tunja y Pasto'
            ]
        },
        {
            name: 'CATHIE V',
            category: 'ARTISTA NACIONAL',
            genre: 'Techno / Hypnotic / Modular / Hardgroove',
            bio: 'Cathie V (Catalina Villegas) es una DJ y curadora musical enfocada en el techno nacida en la ciudad de Cali, que ha encontrado en la escena underground su verdadero hábitat. Desde su adolescencia, su conexión con el electro punk, post punk y electro trash la llevó a sumergirse en la cultura del baile como una experiencia pura y visceral. A finales de 2023, decidió dar el siguiente paso y construir su propio espacio dentro de la escena, iniciando su proyecto como DJ y fundando Morphosis, su primer colectivo. Con apenas 22 años, Cathie V ha logrado consolidarse en la movida caleña, destacando por su versatilidad y su energía arrolladora en cabina, creando una conexión auténtica con el público a través de su selección musical ecléctica y vibrante.',
            experience: 'Desde finales de 2023, con breakthrough en 2024',
            videoUrl: 'https://www.youtube.com/embed/Acv6HZpEItc',
            highlights: [
                'Ganadora de competencia - presentó en Electrip Rave 2024, uno de los festivales más importantes del Valle',
                'Ha compartido escenario con Stefan Vincent, Grace Dahl, Jeroen Search, Marc Houle, JXXXO y Nastia',
                'B2B destacado con Ben Long, consolidando su lugar en el circuito techno',
                'Fundadora de Morphosis, su primer colectivo',
                'Ha expandido su sonido por Colombia: Bogotá, Popayán, Mocoa, Pasto y Palmira'
            ]
        },
        {
            name: 'ZHIRA B2B KALLICEBUS',
            category: 'ARTISTA REGIONAL',
            genre: 'Techno / Progressive House',
            bio: 'Dupla explosiva que combina lo mejor del techno oscuro con progressive house melódico. ZHIRA y KALLICEBUS crean sets únicos donde la energía y la melodía se fusionan perfectamente.',
            experience: 'Más de 8 años combinados dominando la escena electrónica',
            videoUrl: 'https://www.youtube.com/embed/vwpk6YboiPM',
            highlights: [
                'Sets B2B reconocidos en festivales regionales',
                'Química perfecta en cabina',
                'Transiciones impecables entre estilos',
                'Residentes en clubs de la región'
            ]
        },
        {
            name: 'JHONSOUND B2B KHOPRE',
            category: 'ARTISTA REGIONAL',
            genre: 'Hypnotic Groove / Techno',
            bio: 'Dupla dinámica especializada en groove hipnótico y techno progresivo. JHONSOUND y KHOPRE crean paisajes sonoros envolventes que transportan al público a través de sets progresivos perfectamente construidos.',
            experience: '7 años combinados en la escena groove',
            highlights: [
                'Sets maratónicos de 8+ horas',
                'Transiciones perfectas y fluidas',
                'Conocidos por su química en cabina',
                'Curadores de eventos especializados'
            ]
        },
        {
            name: 'DANNG',
            category: 'ARTISTA REGIONAL',
            genre: 'Reggaeton / Latin Core',
            bio: 'Joven talento que está revolucionando la escena urbana con su propuesta fresca de reggaeton alternativo y latin core. DANNG combina beats urbanos con elementos electrónicos para crear un sonido único y energético.',
            experience: '4 años emergiendo en la escena urbana',
            highlights: [
                'Sets virales en redes sociales',
                'Colaboraciones con artistas urbanos',
                'Propuesta innovadora de reggaeton experimental',
                'Ganador de competencias de DJs emergentes'
            ]
        }
    ]

    const openArtistModal = (artist) => {
        setSelectedArtist(artist)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setTimeout(() => setSelectedArtist(null), 300)
    }

    const handleTicketClick = () => {
        window.open('https://wa.me/573124524674?text=Hola!%20Quiero%20información%20sobre%20las%20boletas%20para%20SAFAERA%202026', '_blank')
    }

    return (
        <div className="safaera-home">
            {/* Animated Grid Background */}
            <div className="grid-background"></div>

            {/* Gradient Overlay */}
            <div className="gradient-overlay"></div>

            {/* Main Content */}
            <div className="hero-content">
                {/* Title with Stroke Effect */}
                <motion.div
                    className="title-container"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <h1 className="main-title">
                        <span className="title-outline">SAFAERA</span>
                        <span className="title-fill">SAFAERA</span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.div
                    className="subtitle-pill"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <p>Del sol al descontrol</p>
                </motion.div>


                {/* Totem with Y-axis rotation */}
                <motion.div
                    className="tribal-mask-container"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        rotateY: [0, 360]
                    }}
                    transition={{
                        opacity: { duration: 1, delay: 0.8 },
                        rotateY: { duration: 8, repeat: Infinity, ease: "linear" }
                    }}
                >
                    <img
                        src="/src/assets/Capa 5 (1).svg"
                        alt="Totem SAFAERA"
                        className="tribal-mask"
                    />
                </motion.div>


                {/* Event Info */}
                <motion.div
                    className="event-info"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                >
                    <div className="date-box">
                        <h2>28.FEBRERO</h2>
                    </div>
                    <div className="time-box">
                        <h3>1:00 PM - 6:00 AM</h3>
                    </div>
                    <div className="location-box">
                        <h3>FLORENCIA</h3>
                    </div>
                    <div className="venue-box">
                        <span className="pin-icon">📍</span>
                        <p>JURAZZIC PARK</p>
                    </div>
                    <button onClick={handleTicketClick} className="ticket-button-hero">
                        🎟️ COMPRAR BOLETAS
                    </button>
                </motion.div>

                {/* Music Genres */}
                <motion.div
                    className="genres-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                >
                    <div className="genres-scroll">
                        {genres.map((genre, index) => (
                            <motion.span
                                key={index}
                                className="genre-tag"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                            >
                                {genre}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>

                {/* Year watermark */}
                <div className="year-watermark">2026</div>
            </div>

            {/* Artists Section */}
            <section className="artists-section">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="section-title-main">LINEUP</h2>
                    <p className="section-subtitle">Conoce a los artistas que harán vibrar SAFAERA 2026</p>
                </motion.div>

                <div className="artists-grid-home">
                    {artists.map((artist, index) => (
                        <motion.div
                            key={index}
                            className="artist-card-home"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -10 }}
                            onClick={() => openArtistModal(artist)}
                        >
                            <div className="artist-card-content">
                                <h3 className="artist-card-name">{artist.name}</h3>
                                <span className="artist-card-category">{artist.category}</span>
                                <p className="artist-card-genre">{artist.genre}</p>
                                <button className="artist-card-btn">Ver más</button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Ticket CTA Section */}
                <motion.div
                    className="ticket-cta-section"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="ticket-cta-title">¡ASEGURA TU ENTRADA!</h3>
                    <p className="ticket-cta-text">No te quedes sin tu boleta para SAFAERA 2026</p>
                    <button onClick={handleTicketClick} className="ticket-button">
                        🎟️ COMPRAR BOLETAS
                    </button>
                </motion.div>

                {/* Dossier CTA */}
                <motion.div
                    className="dossier-cta"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="dossier-text">¿Eres inversionista o patrocinador?</p>
                    <Link to="/sponsors" className="dossier-button">
                        Ver Propuesta Comercial
                    </Link>
                </motion.div>
            </section>

            {/* Artist Modal */}
            <ArtistModal
                artist={selectedArtist}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    )
}

export default SafaeraHome
