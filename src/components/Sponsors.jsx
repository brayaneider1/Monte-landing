import { motion } from 'framer-motion'
import './Sponsors.css'

function Sponsors() {
    const sponsorshipPackages = [
        {
            tier: 'PLATINUM',
            price: '$500,000 COP',
            benefits: [
                'Logo principal en todos los materiales',
                'Stand exclusivo en el evento',
                'Menciones en redes sociales (15+ posts)',
                '7 entradas VIP',
                'Activación de marca conjunta',
                'Branding en escenario principal'
            ]
        },
        {
            tier: 'GOLD',
            price: '$250,000 COP',
            benefits: [
                'Video promocional de su establecimiento',
                'Logo en materiales principales',
                'Stand en zona comercial',
                'Menciones en redes sociales (8+ posts)',
                '4 entradas VIP',
                'Branding en áreas comunes'
            ]
        },
        {
            tier: 'SILVER',
            price: '$150,000 COP',
            benefits: [
                'Inclusión en todos los materiales',
                '2 boletas VIP',
                'Menciones en redes sociales',
                'Branding digital'
            ]
        }
    ]

    const eventStats = [
        { label: 'Asistentes Esperados', value: '200+' },
        { label: 'Horas de Evento', value: '12+' },
        { label: 'Artistas', value: '6' },
        { label: 'Visualizaciones', value: '10,000+' }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="sponsors-page">
            {/* Background Effects */}
            <div className="sponsors-grid-bg"></div>
            <div className="sponsors-gradient"></div>

            <div className="sponsors-content">
                {/* Header */}
                <motion.div
                    className="sponsors-header"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="sponsors-title">
                        <span className="title-outline-sponsors">PROPUESTA</span>
                        <span className="title-fill-sponsors">PROPUESTA</span>
                    </h1>
                    <p className="sponsors-subtitle">COMERCIAL SAFAERA 2026</p>
                    <p className="sponsors-description">
                        Únete a SAFAERA 2026 como patrocinador y conecta tu marca con más de 200 asistentes
                        en el evento de música electrónica más importante de Florencia. Alcanza más de 10,000 visualizaciones para tu marca.
                    </p>
                </motion.div>

                {/* Event Stats */}
                <motion.section
                    className="stats-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="section-title">📊 IMPACTO DEL EVENTO</h2>
                    <div className="stats-grid">
                        {eventStats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="stat-card"
                                variants={itemVariants}
                            >
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Sponsorship Packages */}
                <motion.section
                    className="packages-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="section-title">💎 PAQUETES DE PATROCINIO</h2>
                    <div className="packages-grid">
                        {sponsorshipPackages.map((pkg, index) => (
                            <motion.div
                                key={index}
                                className={`package-card package-${pkg.tier.toLowerCase()}`}
                                variants={itemVariants}
                                whileHover={{ scale: 1.03, y: -10 }}
                            >
                                <div className="package-tier">{pkg.tier}</div>
                                <div className="package-price">{pkg.price}</div>
                                <ul className="package-benefits">
                                    {pkg.benefits.map((benefit, idx) => (
                                        <li key={idx}>{benefit}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Artist Lineup Summary */}
                <motion.section
                    className="lineup-summary-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <h2 className="section-title">🎵 LINEUP CONFIRMADO</h2>
                    <div className="lineup-summary">
                        <div className="lineup-category">
                            <h3>Headliner</h3>
                            <p>BRENDA B2B MARIA MANUELA</p>
                        </div>
                        <div className="lineup-category">
                            <h3>Artistas Nacionales</h3>
                            <p>KRUBIM • CATHIE V</p>
                        </div>
                        <div className="lineup-category">
                            <h3>Artistas Regionales</h3>
                            <p>ZHIRA B2B KALLICEBUS • JHONSOUND B2B KHOPRE • DANNG</p>
                        </div>
                    </div>
                </motion.section>

                {/* Event Details */}
                <motion.section
                    className="event-details-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                >
                    <h2 className="section-title">📅 DETALLES DEL EVENTO</h2>
                    <div className="details-card">
                        <div className="detail-row">
                            <span className="detail-label">FECHA:</span>
                            <span className="detail-value">28 de Febrero, 2026</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">LUGAR:</span>
                            <span className="detail-value">Jurazzic Park, Florencia</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">HORARIO:</span>
                            <span className="detail-value">1:00 PM - 6:00 AM</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">CAPACIDAD:</span>
                            <span className="detail-value">200 personas</span>
                        </div>
                    </div>
                </motion.section>

                {/* Target Audience & Digital Reach */}
                <motion.section
                    className="audience-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.9 }}
                >
                    <h2 className="section-title">🎯 PÚBLICO OBJETIVO & ALCANCE</h2>
                    <div className="audience-grid">
                        <div className="audience-card">
                            <h3>👥 Perfil Demográfico</h3>
                            <ul>
                                <li><strong>Edad:</strong> 18-35 años (núcleo: 22-28 años)</li>
                                <li><strong>Género:</strong> Mixto, 55% hombres / 45% mujeres</li>
                                <li><strong>Ubicación:</strong> Florencia, Caquetá y región amazónica</li>
                                <li><strong>Nivel socioeconómico:</strong> Medio-Alto</li>
                            </ul>
                        </div>

                        <div className="audience-card">
                            <h3>🎨 Intereses & Estilo de Vida</h3>
                            <ul>
                                <li><strong>Cultura urbana:</strong> Moda streetwear, arte urbano, diseño</li>
                                <li><strong>Tecnología:</strong> Early adopters, gaming, redes sociales</li>
                                <li><strong>Gastronomía:</strong> Experiencias culinarias, bebidas premium</li>
                                <li><strong>Wellness:</strong> Fitness, vida saludable, experiencias al aire libre</li>
                                <li><strong>Viajes:</strong> Turismo de experiencias, festivales internacionales</li>
                            </ul>
                        </div>

                        <div className="audience-card">
                            <h3>💰 Poder Adquisitivo</h3>
                            <ul>
                                <li><strong>Gasto promedio/evento:</strong> $150,000 - $300,000 COP</li>
                                <li><strong>Categorías:</strong> Boletas, bebidas, merchandising, gastronomía</li>
                                <li><strong>Marcas preferidas:</strong> Premium y emergentes con propósito</li>
                                <li><strong>Decisión de compra:</strong> Influenciados por experiencias y valores de marca</li>
                            </ul>
                        </div>

                        <div className="audience-card">
                            <h3>📱 Alcance Digital</h3>
                            <ul>
                                <li><strong>Impresiones totales:</strong> +50,000 en redes sociales</li>
                                <li><strong>Engagement rate:</strong> 8-12% (superior al promedio)</li>
                                <li><strong>Contenido generado:</strong> +500 stories y posts durante el evento</li>
                                <li><strong>Plataformas:</strong> Instagram, TikTok, Facebook, YouTube</li>
                                <li><strong>Influencers:</strong> Cobertura de micro y macro influencers regionales</li>
                            </ul>
                        </div>

                        <div className="audience-card">
                            <h3>🎯 Match con Marcas</h3>
                            <ul>
                                <li><strong>Bebidas:</strong> Cervezas artesanales, licores premium, energizantes</li>
                                <li><strong>Moda:</strong> Streetwear, accesorios, calzado deportivo</li>
                                <li><strong>Tecnología:</strong> Audio, gadgets, apps, servicios digitales</li>
                                <li><strong>Movilidad:</strong> Apps de transporte, vehículos, accesorios</li>
                                <li><strong>Entretenimiento:</strong> Streaming, gaming, experiencias</li>
                            </ul>
                        </div>

                        <div className="audience-card highlight-card">
                            <h3>✨ Valor Agregado</h3>
                            <ul>
                                <li><strong>Comunidad leal:</strong> Asistentes recurrentes a eventos Loop</li>
                                <li><strong>Influencia regional:</strong> Líderes de opinión en sus círculos</li>
                                <li><strong>Contenido orgánico:</strong> Alto nivel de compartición espontánea</li>
                                <li><strong>Experiencia memorable:</strong> 17 horas de activación de marca</li>
                                <li><strong>Posicionamiento:</strong> Asociación con cultura electrónica de calidad</li>
                            </ul>
                        </div>
                    </div>
                </motion.section>

                {/* Contact Section */}
                <motion.section
                    className="contact-section-sponsors"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <h2 className="section-title">💼 CONTACTO COMERCIAL</h2>
                    <div className="contact-card-sponsors">
                        <p className="contact-intro">
                            ¿Interesado en ser parte de SAFAERA 2026? Contáctanos para discutir
                            oportunidades de patrocinio personalizadas para tu marca.
                        </p>
                        <div className="contact-info">
                            <div className="contact-item">
                                <span className="contact-icon">📧</span>
                                <a href="mailto:loop.rave@gmail.com" className="contact-link">
                                    loop.rave@gmail.com
                                </a>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📱</span>
                                <a href="tel:+573175607784" className="contact-link">
                                    +57 317 560 7784
                                </a>
                            </div>
                            <div className="contact-item">
                                <span className="contact-icon">📱</span>
                                <a href="tel:+573124524674" className="contact-link">
                                    +57 312 452 4674
                                </a>
                            </div>
                        </div>
                        <div className="social-links-sponsors">
                            <a href="https://www.instagram.com/loop.rave/" target="_blank" rel="noopener noreferrer" className="social-link-sponsors">📷 Instagram</a>
                            <a href="https://web.facebook.com/people/LOOP-RAVE/61557024395105/" target="_blank" rel="noopener noreferrer" className="social-link-sponsors">📘 Facebook</a>
                            <a href="https://www.youtube.com/channel/UCpI4xm94uFPEYmapRp3z6ow" target="_blank" rel="noopener noreferrer" className="social-link-sponsors">📺 YouTube</a>
                        </div>
                    </div>
                </motion.section>

                {/* Logo */}
                <motion.div
                    className="sponsors-logo"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <svg viewBox="0 0 100 100" className="logo-svg">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#FF1493" strokeWidth="2" />
                        <path d="M50,50 Q30,30 50,10 Q70,30 50,50" fill="#8B00FF" />
                        <circle cx="50" cy="50" r="5" fill="#FF1493" />
                    </svg>
                </motion.div>
            </div>
        </div>
    )
}

export default Sponsors
