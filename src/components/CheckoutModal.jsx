import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CheckoutModal.css';

function CheckoutModal({ isOpen, onClose, selectedOption, event, ticketQty }) {
    const [step, setStep] = useState(1);
    const [leadData, setLeadData] = useState({ 
        name: '', 
        lastName: '', 
        email: '', // Not used anymore but kept in state for now
        docType: 'CC', // Not used anymore
        doc: '', // Not used anymore
        discountCode: '', 
        phone: '' 
    });
    const [attendees, setAttendees] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Calc base price based on options vs event price
    const basePrice = selectedOption ? selectedOption.price : event.price;
    const [discountAmount, setDiscountAmount] = useState(0);

    const ticketName = selectedOption ? selectedOption.name : 'Boleta General';
    const multiplier = selectedOption ? (
        selectedOption.id.includes('combo_2') ? 2 :
        selectedOption.id.includes('combo_3') ? 3 :
        selectedOption.id.includes('combo_4') ? 4 : 1
    ) : 1;
    const totalPersons = multiplier * ticketQty;

    const finalPricePerTicket = basePrice - discountAmount;
    const totalWithoutFee = finalPricePerTicket * ticketQty;
    const wompiFee = (selectedOption?.id === 'prueba_wompi') ? 0 : 3000;
    const totalWithFee = totalWithoutFee + wompiFee;

    const handleNextStep = async (e) => {
        e.preventDefault();
        if (leadData.phone) {
            // Call leads endpoint in background
            fetch('https://loop-core-production.up.railway.app/api/v1/leads/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: leadData.phone,
                    discount_code: leadData.discountCode ? leadData.discountCode : null
                })
            }).catch(err => console.error("Error saving lead:", err));

            // Initialize attendees array
            setAttendees(Array.from({ length: totalPersons }, () => ({
                name: '', email: '', phone: '', ticket_type: ticketName
            })));
            setStep(2);
        }
    };

    const applyDiscount = async () => {
        if (leadData.discountCode.trim()) {
            const code = leadData.discountCode.trim().toUpperCase();
            try {
                const response = await fetch(`https://loop-core-production.up.railway.app/api/v1/orders/discount/${code}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.valid) {
                        setDiscountAmount(basePrice * (data.discount_percent / 100));
                        alert(`¡Código aplicado exitosamente! Descuento: ${data.discount_percent}%`);
                    } else {
                        alert('El código de descuento no es válido o ya alcanzó su límite de usos.');
                        setDiscountAmount(0);
                    }
                } else {
                    alert('Error al validar el código de descuento.');
                    setDiscountAmount(0);
                }
            } catch (error) {
                console.error("Error validando descuento:", error);
                alert('No se pudo validar el código en este momento.');
                setDiscountAmount(0);
            }
        }
    };

    const handleWompiPayment = async () => {
        // Validar que todos los asistentes tengan datos
        for (let i = 0; i < attendees.length; i++) {
            if (!attendees[i].name || !attendees[i].email) {
                alert(`Por favor completa Nombre y Correo para el Asistente #${i + 1}`);
                return;
            }
        }

        setIsProcessing(true);
        try {
            console.log('Creando orden en el backend...');
            const ticketType = selectedOption ? selectedOption.id : 'general';
            
            const payload = {
                event_slug: "selvatica-2026",
                buyer: {
                    phone: leadData.phone,
                    name: attendees[0].name.trim(),
                    email: attendees[0].email.trim()
                },
                items: [
                    {
                        ticket_type: ticketType,
                        quantity: ticketQty
                    }
                ],
                attendees: attendees.map(a => ({
                    name: a.name.trim(),
                    email: a.email.trim(),
                    phone: a.phone || leadData.phone,
                    ticket_type: a.ticket_type
                })),
                payment_method: "wompi"
            };

            if (leadData.discountCode.trim()) {
                payload.discount_code = leadData.discountCode.trim().toUpperCase();
            }

            const response = await fetch('https://loop-core-production.up.railway.app/api/v1/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error al crear la orden. Por favor intenta nuevamente.');
            }

            const responseData = await response.json();
            
            const orderRef = responseData.order_ref;
            const totalAmountInCents = responseData.total_amount * 100;
            const signature = responseData.signature;
            
            // Validate data to prevent malformed URL (which causes CloudFront 403)
            if (!orderRef || isNaN(totalAmountInCents) || totalAmountInCents <= 0 || !signature) {
                console.error("Respuesta del servidor:", responseData);
                throw new Error("El servidor no devolvió un monto, orden o firma válida. Revisa la consola.");
            }

            // Get public key from env, fallback to hardcoded test key if not set properly
            let wompiPublicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "pub_test_Q6yMQTNPxo7bdnp4UvNdv8RmtiRod7Oe";

            // Dynamically load Wompi Widget Script
            if (!window.WidgetCheckout) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.wompi.co/widget.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            // Open Wompi Widget programmatically
            const checkout = new window.WidgetCheckout({
                currency: 'COP',
                amountInCents: totalAmountInCents,
                reference: orderRef,
                publicKey: wompiPublicKey,
                signature: { integrity: signature }
            });

            checkout.open(function (result) {
                const transaction = result.transaction;
                if (transaction.status === "APPROVED") {
                    // Redirect to success page manually after successful payment
                    window.location.href = "/?payment=success";
                }
            });
            
            setIsProcessing(false);
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error procesando el pago');
            setIsProcessing(false);
        }
    };

    const handleTransferPayment = async () => {
        // Validar asistentes
        for (let i = 0; i < attendees.length; i++) {
            if (!attendees[i].name || !attendees[i].email) {
                alert(`Por favor completa Nombre y Correo para el Asistente #${i + 1}`);
                return;
            }
        }
        
        setIsProcessing(true);
        try {
            const ticketType = selectedOption ? selectedOption.id : 'general';
            const payload = {
                event_slug: "selvatica-2026",
                buyer: {
                    phone: leadData.phone,
                    name: attendees[0].name.trim(),
                    email: attendees[0].email.trim()
                },
                items: [{ ticket_type: ticketType, quantity: ticketQty }],
                attendees: attendees.map(a => ({
                    name: a.name.trim(),
                    email: a.email.trim(),
                    phone: a.phone || leadData.phone,
                    ticket_type: a.ticket_type
                })),
                payment_method: "transferencia"
            };
            if (leadData.discountCode.trim()) {
                payload.discount_code = leadData.discountCode.trim().toUpperCase();
            }

            const response = await fetch('https://loop-core-production.up.railway.app/api/v1/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error al registrar orden');
            const data = await response.json();

            const base = "https://wa.me/573124524674";
            const dateStr = event.dateDisplay;
            
            let attendeesText = attendees.map((a, i) => `Asistente ${i+1}: ${a.name} (${a.email})`).join('%0A');
            const message = `Hola! Soy ${attendees[0].name}. Mi WhatsApp es ${leadData.phone}. Quiero pagar por transferencia la orden *${data.order_ref}*.%0A%0AHe comprado ${ticketQty}x ${ticketName} para ${event.name} 🌿.%0ATotal a pagar: $${totalWithoutFee.toLocaleString()} COP.%0A%0A*DATOS ASISTENTES:*%0A${attendeesText}`;
            
            window.open(`${base}?text=${message}`, '_blank');
            onClose();
        } catch (err) {
            alert('Ocurrió un error registrando tu orden para transferencia. Intenta de nuevo.');
            setIsProcessing(false);
        }
    };

    // Reset step when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setStep(1), 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="checkout-modal-overlay">
                    <motion.div
                        className="checkout-modal-container"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button className="checkout-close-btn" onClick={onClose}>×</button>
                        
                        {step === 1 ? (
                            <div className="checkout-step step-1" style={{ paddingTop: '2rem' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--neon-green)', fontSize: '1.5rem' }}>
                                    SELVÁTICA
                                </h3>
                                <p style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'monospace', opacity: 0.8 }}>
                                    EXPERIENCIA INMERSIVA EN EL PIEDEMONTE
                                </p>
                                
                                <form onSubmit={handleNextStep}>
                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <input 
                                            type="tel" 
                                            required 
                                            value={leadData.phone}
                                            onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                                            placeholder="Ingresa tu número de teléfono"
                                            autoFocus
                                            style={{ textAlign: 'center', fontSize: '1.2rem', padding: '1rem' }}
                                        />
                                    </div>
                                    <button type="submit" className="terminal-btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                                        ADQUIRIR BOLETERÍA
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="checkout-step step-2">
                                <h3 style={{ marginBottom: '1rem', color: 'var(--neon-green)' }}>DATOS Y PAGO</h3>
                                
                                <form onSubmit={(e) => e.preventDefault()}>
                                    {attendees.map((att, index) => (
                                        <div key={index} className="checkout-form-grid" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                            <h4 style={{ color: 'var(--neon-green)', gridColumn: '1 / -1', marginBottom: '0.5rem' }}>Asistente {index + 1}</h4>
                                            
                                            {index > 0 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const newAtts = [...attendees];
                                                        newAtts[index] = { ...newAtts[0], ticket_type: newAtts[index].ticket_type };
                                                        setAttendees(newAtts);
                                                    }}
                                                    style={{ gridColumn: '1 / -1', background: 'transparent', border: '1px solid var(--neon-green)', color: 'var(--neon-green)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem' }}
                                                >
                                                    Autorellenar con mis datos
                                                </button>
                                            )}

                                            <div className="form-group full-width">
                                                <label>NOMBRE COMPLETO</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={att.name}
                                                    onChange={(e) => {
                                                        const newAtts = [...attendees];
                                                        newAtts[index].name = e.target.value;
                                                        setAttendees(newAtts);
                                                    }}
                                                    placeholder="Ej. Neo Anderson"
                                                    autoFocus={index === 0}
                                                />
                                            </div>

                                            <div className="form-group full-width" style={{ marginTop: '1rem' }}>
                                                <label>CORREO ELECTRÓNICO (Para enviar tu boleta)</label>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    value={att.email}
                                                    onChange={(e) => {
                                                        const newAtts = [...attendees];
                                                        newAtts[index].email = e.target.value;
                                                        setAttendees(newAtts);
                                                    }}
                                                    placeholder="Ej. neo@matrix.com"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="checkout-form-grid">
                                        <div className="form-group full-width" style={{ marginTop: '0.5rem' }}>
                                            <label>CÓDIGO DE ACCESO / DESCUENTO (OPCIONAL)</label>
                                            <div className="discount-group">
                                                <input 
                                                    type="text" 
                                                    value={leadData.discountCode}
                                                    onChange={(e) => setLeadData({...leadData, discountCode: e.target.value})}
                                                    placeholder="Ingresa código"
                                                    style={{ flex: 1 }}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={applyDiscount}
                                                    style={{ background: 'var(--neon-green)', color: '#000', border: 'none', padding: '0.6rem 1.2rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
                                                >
                                                    APLICAR
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="payment-summary" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '4px' }}>
                                    <p style={{ margin: 0 }}>Ticket: {selectedOption ? selectedOption.name : 'General'} (x{ticketQty})</p>
                                    <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', color: 'var(--neon-green)' }}>Total Final: ${totalWithoutFee.toLocaleString()} COP</p>
                                </div>

                                <div className="payment-options" style={{ marginTop: '1.5rem' }}>
                                    <button className="payment-btn direct-transfer" onClick={handleTransferPayment}>
                                        <div className="btn-title">Transferencia Manual (Vía WhatsApp)</div>
                                        <div className="btn-benefit">0 COP adicionales</div>
                                    </button>

                                    <div className="wompi-container">
                                        <button className="payment-btn wompi-btn" onClick={handleWompiPayment} disabled={isProcessing}>
                                            <div className="btn-title">{isProcessing ? 'PROCESANDO...' : 'Pagar con Tarjeta (Wompi)'}</div>
                                            {wompiFee > 0 && <div className="btn-benefit">+ $3.000 COP (Recargo de la pasarela de pagos Wompi)</div>}
                                        </button>
                                    </div>
                                </div>
                                <button className="back-btn" onClick={() => setStep(1)} style={{ marginTop: '1rem' }}>
                                    ← VOLVER AL TELÉFONO
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default CheckoutModal;
