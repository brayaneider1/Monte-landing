import { motion, AnimatePresence } from 'framer-motion'
import './ArtistModal.css'

function ArtistModal({ artist, isOpen, onClose }) {
    if (!artist) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="modal-container"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="modal-content">
                            {/* Close Button */}
                            <button className="modal-close" onClick={onClose}>
                                ✕
                            </button>

                            {/* Artist Header */}
                            <motion.div
                                className="modal-header"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="modal-artist-name">{artist.name}</h2>
                                <span className="modal-artist-category">{artist.category}</span>
                            </motion.div>

                            {/* Artist Bio */}
                            <motion.div
                                className="modal-body"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p className="modal-bio">{artist.bio}</p>

                                {artist.videoUrl && (
                                    <div className="modal-video-section">
                                        <div className="video-container">
                                            <iframe
                                                width="100%"
                                                height="315"
                                                src={artist.videoUrl}
                                                title="Artist Video"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}

                                {artist.genre && (
                                    <div className="modal-genre-tag">
                                        <span className="genre-label">Género:</span>
                                        <span className="genre-value">{artist.genre}</span>
                                    </div>
                                )}

                                {artist.experience && (
                                    <div className="modal-info-section">
                                        <h4>Experiencia</h4>
                                        <p>{artist.experience}</p>
                                    </div>
                                )}

                                {artist.highlights && (
                                    <div className="modal-info-section">
                                        <h4>Destacados</h4>
                                        <ul className="highlights-list">
                                            {artist.highlights.map((highlight, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + index * 0.1 }}
                                                >
                                                    {highlight}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>

                            {/* Footer */}
                            <motion.div
                                className="modal-footer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <button className="modal-cta-btn" onClick={onClose}>
                                    Cerrar
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ArtistModal
