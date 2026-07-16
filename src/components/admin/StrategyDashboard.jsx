import React, { useState } from 'react';
import { selvaticaData } from '../../data/selvatica';

const data = selvaticaData.marketingStrategy;

export default function StrategyDashboard() {
  const [subTab, setSubTab] = useState('kpi');

  const formatCOP = (val) => {
    if (typeof val === 'string' && val.includes('$')) return val;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border-glass)', backdropFilter: 'blur(10px)' }}>
        <img src="/selvatica_monochrome.png" alt="Selvatica" style={{ width: '100px', height: '100px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.3))' }} />
        <div>
          <h2 className="admin-section-title" style={{ margin: 0, fontSize: '1.5rem' }}>{data.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.subtitle}</p>
          <div style={{ display: 'inline-block', background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', marginTop: '12px', fontWeight: 'bold', border: '1px solid rgba(0,255,136,0.3)' }}>
            TIMELINE: {data.timeline}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
        {[
          { id: 'kpi', label: 'METAS & COMPETENCIA' },
          { id: 'fases', label: 'FASES (KANBAN)' },
          { id: 'alianzas', label: 'ALIANZAS & IA' },
          { id: 'presupuesto', label: 'FINANZAS & BARRA' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              background: subTab === tab.id ? 'var(--neon-green)' : 'var(--bg-glass)',
              color: subTab === tab.id ? 'var(--bg-dark)' : 'var(--text-main)',
              border: `1px solid ${subTab === tab.id ? 'var(--neon-green)' : 'var(--border-glass)'}`,
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: METAS ─── */}
      {subTab === 'kpi' && (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          
          <div className="admin-section" style={{ margin: 0 }}>
            <h3 style={{ color: 'var(--neon-green)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '15px' }}>OBJETIVOS (KPIs)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Creyentes Vendidas</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--neon-green)' }}>{data.kpi.creyentes_vendidas}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>a {formatCOP(data.kpi.creyentes_precio)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preventa 1</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--neon-green)' }}>{data.kpi.preventa1_vendidas}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>a {formatCOP(data.kpi.preventa1_precio)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Meta Global Boletas</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data.kpi.boletas_vendidas} <span style={{ color: 'var(--text-muted)', fontSize: '20px' }}>/ {data.kpi.meta_boletas}</span></div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${(data.kpi.boletas_vendidas / data.kpi.meta_boletas) * 100}%`, height: '100%', background: 'var(--neon-green)' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ margin: 0, borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)' }}>
            <h3 style={{ color: '#EF4444', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '10px', marginBottom: '15px' }}>ANÁLISIS DE COMPETENCIA</h3>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#EF4444', marginBottom: '5px' }}>Rival</div>
              <div style={{ fontSize: '14px' }}>{data.competencia.rival}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--gold)', marginBottom: '5px' }}>Diagnóstico Estratégico</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{data.competencia.diagnostico}</div>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB: FASES ─── */}
      {subTab === 'fases' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {data.fases.map((fase) => (
            <div key={fase.id} className="admin-section" style={{ margin: 0 }}>
              <div style={{ borderLeft: '4px solid var(--neon-green)', paddingLeft: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{fase.nombre}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>{fase.objetivo}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                {fase.acciones.map((acc, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ background: 'var(--neon-green)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{acc.fecha}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{acc.canal}</span>
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-main)' }}>{acc.pieza}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '10px' }}>{acc.detalles}</p>
                    
                    {acc.requerimientos && acc.requerimientos.length > 0 && (
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--neon-green)', marginBottom: '5px', textTransform: 'uppercase' }}>Requerimientos</div>
                        <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {acc.requerimientos.map((req, ridx) => <li key={ridx} style={{ marginBottom: '3px' }}>{req}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB: ALIANZAS & IA ─── */}
      {subTab === 'alianzas' && (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          <div className="admin-section" style={{ margin: 0 }}>
            <h3 style={{ color: 'var(--gold)', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '10px', marginBottom: '15px' }}>RUTA DE CAPTACIÓN (ALIANZAS)</h3>
            {data.patrocinadores_estrategia?.ruta_captacion?.map((ruta, idx) => (
              <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '5px' }}>{ruta.nivel}</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>{ruta.target}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Oferta pedida:</strong> {ruta.oferta_pedida}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.4' }}>{ruta.justificacion}</div>
                <div style={{ fontSize: '12px', color: 'var(--neon-green)', background: 'rgba(0,255,136,0.1)', padding: '8px', borderRadius: '4px' }}>{ruta.gancho_monte}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-section" style={{ margin: 0 }}>
              <h3 style={{ color: 'var(--neon-green)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '15px' }}>IA ENGINEERING</h3>
              {data.ia_engineering?.map((ia, idx) => (
                <div key={idx} style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>{ia.titulo}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{ia.detalles}</div>
                </div>
              ))}
            </div>

            <div className="admin-section" style={{ margin: 0, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <h3 style={{ color: '#3B82F6', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '10px', marginBottom: '15px' }}>HOOKS TIKTOK</h3>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {data.contexto_marketing?.tiktok_hooks?.map((h, i) => (
                  <li key={i} style={{ marginBottom: '10px', lineHeight: '1.4' }}>"{h}"</li>
                ))}
              </ul>
              <div style={{ marginTop: '15px', fontSize: '11px', color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '4px' }}>
                {data.contexto_marketing?.tiktok_horarios}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB: FINANZAS & BARRA ─── */}
      {subTab === 'presupuesto' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="admin-section" style={{ margin: 0 }}>
              <h3 style={{ color: 'var(--neon-green)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '15px' }}>NUEVOS INGRESOS (UPSELLS)</h3>
              {data.nuevosIngresos?.map((ing, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{ing.titulo}</strong>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{ing.ingreso_estimado}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ing.detalles}</div>
                </div>
              ))}
            </div>

            <div className="admin-section" style={{ margin: 0 }}>
              <h3 style={{ color: 'var(--gold)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '10px', marginBottom: '15px' }}>ESTRATEGIAS TAQUILLA & BARRA</h3>
              <div style={{ fontSize: '12px', color: 'var(--gold)', marginBottom: '10px', fontWeight: 'bold' }}>TAQUILLA</div>
              {data.estrategias_pro_taquilla?.map((est, idx) => (
                <div key={'t'+idx} style={{ marginBottom: '10px', fontSize: '12px' }}>
                  <strong style={{ color: 'white' }}>{est.titulo}:</strong> <span style={{ color: 'var(--text-muted)' }}>{est.detalles}</span>
                </div>
              ))}
              <div style={{ fontSize: '12px', color: 'var(--gold)', margin: '15px 0 10px 0', fontWeight: 'bold' }}>BARRA</div>
              {data.estrategias_pro_barra?.map((est, idx) => (
                <div key={'b'+idx} style={{ marginBottom: '10px', fontSize: '12px' }}>
                  <strong style={{ color: 'white' }}>{est.titulo}:</strong> <span style={{ color: 'var(--text-muted)' }}>{est.detalles}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section" style={{ margin: 0 }}>
            <h3 style={{ color: 'var(--neon-green)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '15px' }}>RESUMEN FINANCIERO TOTAL</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CONCEPTO</th>
                    <th style={{ textAlign: 'right' }}>VALOR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ingresos Esperados (Taquilla 100 + Barra + Patrocinios + Upsells)</td>
                    <td style={{ textAlign: 'right', color: 'var(--neon-green)', fontWeight: 'bold' }}>{data.resumen_total?.ingresos_esperados}</td>
                  </tr>
                  <tr>
                    <td>Costos Estimados Operación</td>
                    <td style={{ textAlign: 'right', color: '#EF4444' }}>{data.resumen_total?.costos_estimados}</td>
                  </tr>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <td style={{ fontWeight: 'bold' }}>UTILIDAD BRUTA ESTIMADA</td>
                    <td style={{ textAlign: 'right', color: 'var(--neon-green)', fontWeight: 'bold', fontSize: '18px' }}>{data.resumen_total?.utilidad_bruta_estimada}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {data.resumen_total?.punto_equilibrio && (
              <div style={{ marginTop: '15px', background: 'rgba(0,255,136,0.1)', borderLeft: '4px solid var(--neon-green)', padding: '10px 15px', borderRadius: '0 8px 8px 0', fontSize: '13px' }}>
                <strong>Punto de Equilibrio (Break-Even):</strong> {data.resumen_total.punto_equilibrio}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
