import { useState, useEffect } from 'react'
import { getOrders, registerManualSale, formatCOP, getBuyers, createBuyer, updateBuyer, deleteBuyer, loginAdmin } from '../services/api'
import eventsData from '../data/events.json'
import QRScanner from '../components/admin/QRScanner'
import './AdminPanel.css'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

const TABS = ['VENTA EN MANO', 'ÓRDENES', 'RESUMEN', 'ESCANEAR', 'COMPRADORES (CRM)']

const emptyForm = {
  name: '', doc: '', email: '', phone: '',
              <h2 className="admin-section-title" style={{ margin: 0 }}>
                Directorio de Compradores
                <span className="admin-count">{buyers.length}</span>
              </h2>
              <button className="admin-btn-primary" onClick={() => openBuyerModal()} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                + NUEVO
              </button>
            </div>

            {buyers.length === 0 ? (
              <p className="admin-empty">No hay compradores registrados.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NOMBRE</th>
                      <th>DOCUMENTO</th>
                      <th>EMAIL</th>
                      <th>TELÉFONO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map(b => (
                      <tr key={b.id}>
                        <td className="order-id-cell">{b.id}</td>
                        <td>{b.name || '—'}</td>
                        <td>{b.doc_type} {b.doc || '—'}</td>
                        <td>{b.email || '—'}</td>
                        <td>{b.phone}</td>
                        <td>
                          <button className="admin-btn-edit" onClick={() => openBuyerModal(b)}>Editar</button>
                          <button className="admin-btn-delete" onClick={() => handleDeleteBuyer(b.id)}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL COMPRADOR ─── */}
      {buyerModalOpen && (
        <div className="buyer-modal-overlay">
          <div className="buyer-modal">
            <h3>{buyerForm.id ? 'Editar Comprador' : 'Nuevo Comprador'}</h3>
            <form onSubmit={saveBuyer}>
              <div className="af-grid">
                <div className="af-field">
                  <label>Nombre</label>
                  <input name="name" value={buyerForm.name} onChange={handleBuyerForm} />
                </div>
                <div className="af-field">
                  <label>Tipo Doc</label>
                  <select name="doc_type" value={buyerForm.doc_type} onChange={handleBuyerForm}>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                </div>
                <div className="af-field">
                  <label>Documento</label>
                  <input name="doc" value={buyerForm.doc} onChange={handleBuyerForm} />
                </div>
                <div className="af-field">
                  <label>Teléfono *</label>
                  <input name="phone" required value={buyerForm.phone} onChange={handleBuyerForm} />
                </div>
                <div className="af-field">
                  <label>Email</label>
                  <input name="email" type="email" value={buyerForm.email} onChange={handleBuyerForm} />
                </div>
              </div>
              {buyerErr && <p className="admin-error">{buyerErr}</p>}
              <div className="buyer-modal-actions">
                <button type="button" onClick={() => setBuyerModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
