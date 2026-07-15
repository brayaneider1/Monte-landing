import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CheckoutModal.css';

function WelcomeModal({ isOpen, onClose }) {
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (phone.trim().length >= 7) {
            sessionStorage.setItem('loop_lead_phone', phone);
            
            // Call backend in background
            fetch('https://loop-core-production.up.railway.app/api/v1/leads/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone.trim() })
            }).catch(err => console.error("Error saving lead:", err));

            onClose();
            const section = document.getElementById('tickets-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="checkout-modal-overlay">
                    <motion.div
                        className="checkout-modal-container"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                    >
                        <button className="checkout-close-btn" onClick={onClose}>×</button>
                        
                        <div className="checkout-step step-1" style={{ paddingTop: '2rem' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--neon-green)', fontSize: '1.5rem' }}>
                                SELVÁTICA
                            </h3>
                            <p style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'monospace', opacity: 0.8 }}>
                                EXPERIENCIA INMERSIVA EN EL PIEDEMONTE
                            </p>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Tu número de teléfono"
                                        autoFocus
                                        style={{ 
                                            textAlign: 'center', 
                                            fontSize: '1.4rem', 
                                            padding: '0.8rem 0', 
                                            width: '100%', 
                                            background: 'transparent', 
                                            border: 'none',
                                            borderBottom: '2px solid var(--neon-green)', 
                                            color: '#fff',
                                            outline: 'none',
                                            letterSpacing: '2px'
                                        }}
                                    />
                                </div>
                                <button type="submit" className="terminal-btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                                    ENTRAR A LA EXPERIENCIA
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default WelcomeModal;
