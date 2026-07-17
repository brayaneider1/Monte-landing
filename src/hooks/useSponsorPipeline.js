import { useState, useCallback } from 'react'

const SPONSOR_KEY = 'loop_sponsor_pipeline_v1'

const STAGES = ['prospecto', 'contactado', 'pitch_enviado', 'negociando', 'cerrado', 'perdido']

const DEFAULT_PIPELINE = [
  {
    id: 'sp_001',
    nombre: 'CG Tattoo / San Alejo',
    industria: 'Tatuajes & Cuidado Personal',
    contacto: '',
    instagram: '',
    telefono: '',
    gestionado_por: 'maria',
    etapa: 'prospecto',
    oferta_propuesta: 'Tatuajes gratis = entrada gratis. QR en local captura leads.',
    contraprestacion_acordada: null,
    valor_estimado: 300000,
    fecha_ultimo_contacto: null,
    proximo_seguimiento: null,
    bono_monte: 'Stand físico de tatuajes en vivo gratuito en MONTE.',
    notas: ''
  },
  {
    id: 'sp_002',
    nombre: 'Bakú Disco Bar / Kokona Bar',
    industria: 'Entretenimiento Nocturno (Remate)',
    contacto: '',
    instagram: '',
    telefono: '',
    gestionado_por: 'brayan',
    etapa: 'prospecto',
    oferta_propuesta: '$300.000 COP. Dirigimos todos los asistentes a su puerta con la pulsera de Selvática a las 3 AM.',
    contraprestacion_acordada: null,
    valor_estimado: 300000,
    fecha_ultimo_contacto: null,
    proximo_seguimiento: null,
    bono_monte: 'Mención exclusiva como Lugar oficial del Remate en MONTE.',
    notas: ''
  },
  {
    id: 'sp_003',
    nombre: 'Baron Burger Boss / Primos Burger',
    industria: 'Comidas Rápidas 24h',
    contacto: '',
    instagram: '',
    telefono: '',
    gestionado_por: 'maria',
    etapa: 'prospecto',
    oferta_propuesta: '$100.000 COP o Catering Staff. 15% descuento a asistentes con pulsera entre 4-6 AM.',
    contraprestacion_acordada: null,
    valor_estimado: 100000,
    fecha_ultimo_contacto: null,
    proximo_seguimiento: null,
    bono_monte: 'Foodtruck / Presencia en MONTE si la alianza funciona.',
    notas: ''
  }
]

function load() {
  try {
    const raw = localStorage.getItem(SPONSOR_KEY)
    if (!raw) return DEFAULT_PIPELINE
    return JSON.parse(raw)
  } catch {
    return DEFAULT_PIPELINE
  }
}

function save(data) {
  try {
    localStorage.setItem(SPONSOR_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('useSponsorPipeline: failed to save', e)
  }
}

export { STAGES }

export function useSponsorPipeline() {
  const [pipeline, setPipeline] = useState(() => load())

  const persist = useCallback((updater) => {
    setPipeline(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(next)
      return next
    })
  }, [])

  const addSponsor = useCallback((data = {}) => {
    const newSponsor = {
      id: `sp_${Date.now()}`,
      nombre: '',
      industria: '',
      contacto: '',
      instagram: '',
      telefono: '',
      gestionado_por: 'maria',
      etapa: 'prospecto',
      oferta_propuesta: '',
      contraprestacion_acordada: null,
      valor_estimado: 0,
      fecha_ultimo_contacto: null,
      proximo_seguimiento: null,
      bono_monte: '',
      notas: '',
      ...data
    }
    persist(prev => [...prev, newSponsor])
    return newSponsor.id
  }, [persist])

  const updateSponsor = useCallback((id, patch) => {
    persist(prev => prev.map(s => s.id !== id ? s : { ...s, ...patch }))
  }, [persist])

  const deleteSponsor = useCallback((id) => {
    persist(prev => prev.filter(s => s.id !== id))
  }, [persist])

  const advanceStage = useCallback((id) => {
    persist(prev => prev.map(s => {
      if (s.id !== id) return s
      const idx = STAGES.indexOf(s.etapa)
      const next = STAGES[Math.min(idx + 1, STAGES.length - 1)]
      return { ...s, etapa: next, fecha_ultimo_contacto: new Date().toISOString().slice(0, 10) }
    }))
  }, [persist])

  // Computed
  const getPipelineStats = useCallback(() => {
    const byStage = {}
    STAGES.forEach(s => { byStage[s] = pipeline.filter(p => p.etapa === s) })
    const valorTotal = pipeline
      .filter(p => p.etapa === 'cerrado')
      .reduce((sum, p) => sum + (p.valor_estimado || 0), 0)
    const vencidos = pipeline.filter(p => {
      if (!p.proximo_seguimiento || p.etapa === 'cerrado' || p.etapa === 'perdido') return false
      return new Date(p.proximo_seguimiento) < new Date()
    })
    return { byStage, valorTotal, vencidos }
  }, [pipeline])

  const resetToDefaults = useCallback(() => {
    save(DEFAULT_PIPELINE)
    setPipeline(DEFAULT_PIPELINE)
  }, [])

  return {
    pipeline,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    advanceStage,
    getPipelineStats,
    resetToDefaults
  }
}
