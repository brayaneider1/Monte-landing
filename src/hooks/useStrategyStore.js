import { useState, useCallback } from 'react'
import { selvaticaData } from '../data/selvatica'

const STORAGE_KEY = 'selvatica_strategy_v2'

// Enrich raw fases with tracking fields
function enrichFases(fases) {
  return fases.map(fase => ({
    ...fase,
    acciones: fase.acciones.map(acc => ({
      ...acc,
      status: acc.status || 'pendiente',       // pendiente | en_progreso | publicado | bloqueado
      asignado_a: acc.asignado_a || 'ambos',   // brayan | maria | ambos | externo
      notas_reales: acc.notas_reales || '',
      fecha_real_publicacion: acc.fecha_real_publicacion || null,
      metricas: acc.metricas || {
        impresiones: null,
        alcance: null,
        engagement_rate: null,
        clicks_link: null,
        shares: null,
        saves: null,
        emv_calculado: null,
        boletas_atribuidas: 0,
        url_post: ''
      }
    }))
  }))
}

function buildSeed() {
  const raw = selvaticaData.marketingStrategy
  return {
    ...raw,
    fases: enrichFases(raw.fases),
    tiktokEstrategia: raw.tiktokEstrategia || [],
    engagement: raw.engagement || [],
    impresos: raw.impresos || [],
    ia_engineering: raw.ia_engineering || [],
    estrategiasVentas: raw.estrategiasVentas || [],
    nuevosIngresos: raw.nuevosIngresos || [],
    estrategias_pro_taquilla: raw.estrategias_pro_taquilla || [],
    estrategias_pro_barra: raw.estrategias_pro_barra || [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeed()
    const parsed = JSON.parse(raw)
    // Always enrich fases in case schema changed
    return { ...parsed, fases: enrichFases(parsed.fases || []) }
  } catch {
    return buildSeed()
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('useStrategyStore: failed to save', e)
  }
}

export function useStrategyStore() {
  const [strategy, setStrategy] = useState(() => load())

  const persist = useCallback((updater) => {
    setStrategy(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(next)
      return next
    })
  }, [])

  // ── Update any top-level field (title, subtitle, kpi, etc.) ──
  const updateField = useCallback((key, value) => {
    persist(prev => ({ ...prev, [key]: value }))
  }, [persist])

  // ── Update KPI field ──
  const updateKpi = useCallback((field, value) => {
    persist(prev => ({ ...prev, kpi: { ...prev.kpi, [field]: value } }))
  }, [persist])

  // ── Update task status/fields within a fase ──
  const updateTask = useCallback((faseId, taskId, patch) => {
    persist(prev => ({
      ...prev,
      fases: prev.fases.map(fase =>
        fase.id !== faseId ? fase : {
          ...fase,
          acciones: fase.acciones.map(acc =>
            acc.id !== taskId ? acc : { ...acc, ...patch }
          )
        }
      )
    }))
  }, [persist])

  // ── Update task metrics ──
  const updateTaskMetrics = useCallback((faseId, taskId, metricsPatch) => {
    persist(prev => ({
      ...prev,
      fases: prev.fases.map(fase =>
        fase.id !== faseId ? fase : {
          ...fase,
          acciones: fase.acciones.map(acc =>
            acc.id !== taskId ? acc : {
              ...acc,
              metricas: { ...acc.metricas, ...metricsPatch }
            }
          )
        }
      )
    }))
  }, [persist])

  // ── Add a new task to a fase ──
  const addTask = useCallback((faseId, taskData) => {
    const newId = `t_${Date.now()}`
    const newTask = {
      id: newId,
      fecha: taskData.fecha || '',
      pieza: taskData.pieza || 'Nueva Tarea',
      formato: taskData.formato || '',
      canal: taskData.canal || '',
      detalles: taskData.detalles || '',
      requerimientos: [],
      status: 'pendiente',
      asignado_a: taskData.asignado_a || 'ambos',
      notas_reales: '',
      fecha_real_publicacion: null,
      metricas: {
        impresiones: null, alcance: null, engagement_rate: null,
        clicks_link: null, shares: null, saves: null,
        emv_calculado: null, boletas_atribuidas: 0, url_post: ''
      }
    }
    persist(prev => ({
      ...prev,
      fases: prev.fases.map(fase =>
        fase.id !== faseId ? fase : {
          ...fase,
          acciones: [...fase.acciones, newTask]
        }
      )
    }))
  }, [persist])

  // ── Delete a task from a fase ──
  const deleteTask = useCallback((faseId, taskId) => {
    persist(prev => ({
      ...prev,
      fases: prev.fases.map(fase =>
        fase.id !== faseId ? fase : {
          ...fase,
          acciones: fase.acciones.filter(a => a.id !== taskId)
        }
      )
    }))
  }, [persist])

  // ── CRUD for array sections (tiktokEstrategia, engagement, impresos, etc.) ──
  const addListItem = useCallback((key, item) => {
    persist(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: `item_${Date.now()}`, ...item }]
    }))
  }, [persist])

  const updateListItem = useCallback((key, itemId, patch) => {
    persist(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(item =>
        item.id === itemId ? { ...item, ...patch } : item
      )
    }))
  }, [persist])

  const deleteListItem = useCallback((key, itemId) => {
    persist(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(item => item.id !== itemId)
    }))
  }, [persist])

  // ── Computed stats ──
  const getPhaseStats = useCallback(() => {
    return (strategy.fases || []).map(fase => {
      const total = fase.acciones.length
      const completadas = fase.acciones.filter(a => a.status === 'publicado').length
      const en_progreso = fase.acciones.filter(a => a.status === 'en_progreso').length
      const bloqueadas = fase.acciones.filter(a => a.status === 'bloqueado').length
      const pct = total > 0 ? Math.round((completadas / total) * 100) : 0
      return { id: fase.id, nombre: fase.nombre, total, completadas, en_progreso, bloqueadas, pct }
    })
  }, [strategy])

  const getTotalEmv = useCallback(() => {
    let total = 0
    ;(strategy.fases || []).forEach(fase => {
      fase.acciones.forEach(acc => {
        if (acc.metricas?.emv_calculado) total += acc.metricas.emv_calculado
      })
    })
    return total
  }, [strategy])

  // ── Reset to original seed ──
  const resetToDefaults = useCallback(() => {
    const seed = buildSeed()
    save(seed)
    setStrategy(seed)
  }, [])

  return {
    strategy,
    updateField,
    updateKpi,
    updateTask,
    updateTaskMetrics,
    addTask,
    deleteTask,
    addListItem,
    updateListItem,
    deleteListItem,
    getPhaseStats,
    getTotalEmv,
    resetToDefaults
  }
}
