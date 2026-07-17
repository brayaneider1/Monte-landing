import { useState, useCallback } from 'react'

const CREW_KEY = 'loop_marketing_crew_v1'

const DEFAULT_CREW = {
  artistas: [
    {
      id: 'art_diavalo',
      nombre: 'DIAVALO',
      rol: 'artista',
      instagram: '@diavalo',
      tiktok: '',
      telefono: '',
      gestionado_por: 'brayan',
      acuerdo: '$1.000.000 COP cachet + 2 entradas',
      estado_pago: 'pendiente',
      utm_link: '',
      codigo_descuento: '',
      publicaciones_planeadas: 2,
      publicaciones_realizadas: 0,
      boletas_atribuidas: 0,
      emv_total: 0,
      meta_user_id: null,
      posts: [],
      notas: 'Headliner confirmado.'
    },
    {
      id: 'art_omnicloud',
      nombre: 'OMNICLOUD',
      rol: 'artista',
      instagram: '@omnicloud',
      tiktok: '',
      telefono: '',
      gestionado_por: 'brayan',
      acuerdo: '$350.000 COP',
      estado_pago: 'pendiente',
      utm_link: '',
      codigo_descuento: '',
      publicaciones_planeadas: 1,
      publicaciones_realizadas: 0,
      boletas_atribuidas: 0,
      emv_total: 0,
      meta_user_id: null,
      posts: [],
      notas: ''
    }
  ],
  promotores: [],
  embajadores: []
}

const CPM_REFERENCIA = 8000 // COP por 1.000 impresiones

function calcEMV(alcance) {
  if (!alcance) return 0
  return Math.round((alcance / 1000) * CPM_REFERENCIA)
}

function buildDefaultPost() {
  return {
    id: `post_${Date.now()}`,
    fecha_programada: '',
    fecha_real: null,
    tipo: 'reel',            // reel | story | post | tiktok
    canal: 'instagram',
    status: 'pendiente',     // pendiente | publicado | bloqueado | cancelado
    url_post: '',
    meta_post_id: null,
    impresiones: null,
    alcance: null,
    engagement_rate: null,
    clicks_link: null,
    shares: null,
    saves: null,
    emv_calculado: null,
    boletas_atribuidas: 0,
    notas: ''
  }
}

function load() {
  try {
    const raw = localStorage.getItem(CREW_KEY)
    if (!raw) return DEFAULT_CREW
    return JSON.parse(raw)
  } catch {
    return DEFAULT_CREW
  }
}

function save(data) {
  try {
    localStorage.setItem(CREW_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('useMarketingCrew: failed to save', e)
  }
}

export function useMarketingCrew() {
  const [crew, setCrew] = useState(() => load())

  const persist = useCallback((updater) => {
    setCrew(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(next)
      return next
    })
  }, [])

  // ── Add person to a role group ──
  const addPerson = useCallback((role, personData) => {
    const newPerson = {
      id: `${role.slice(0, 3)}_${Date.now()}`,
      nombre: '',
      rol: role,
      instagram: '',
      tiktok: '',
      telefono: '',
      gestionado_por: 'maria',
      acuerdo: '',
      estado_pago: 'pendiente',
      utm_link: '',
      codigo_descuento: '',
      publicaciones_planeadas: 0,
      publicaciones_realizadas: 0,
      boletas_atribuidas: 0,
      emv_total: 0,
      meta_user_id: null,
      posts: [],
      notas: '',
      ...personData
    }
    persist(prev => ({
      ...prev,
      [role + 's']: [...(prev[role + 's'] || []), newPerson]
    }))
    return newPerson.id
  }, [persist])

  // ── Update person fields ──
  const updatePerson = useCallback((role, personId, patch) => {
    persist(prev => ({
      ...prev,
      [role + 's']: (prev[role + 's'] || []).map(p =>
        p.id !== personId ? p : { ...p, ...patch }
      )
    }))
  }, [persist])

  // ── Delete person ──
  const deletePerson = useCallback((role, personId) => {
    persist(prev => ({
      ...prev,
      [role + 's']: (prev[role + 's'] || []).filter(p => p.id !== personId)
    }))
  }, [persist])

  // ── Add post to a person ──
  const addPost = useCallback((role, personId, postData = {}) => {
    const newPost = { ...buildDefaultPost(), ...postData }
    persist(prev => ({
      ...prev,
      [role + 's']: (prev[role + 's'] || []).map(p => {
        if (p.id !== personId) return p
        const posts = [...(p.posts || []), newPost]
        return { ...p, posts }
      })
    }))
  }, [persist])

  // ── Update post on a person ──
  const updatePost = useCallback((role, personId, postId, patch) => {
    persist(prev => ({
      ...prev,
      [role + 's']: (prev[role + 's'] || []).map(p => {
        if (p.id !== personId) return p
        const posts = (p.posts || []).map(post => {
          if (post.id !== postId) return post
          const updated = { ...post, ...patch }
          // Auto-calc EMV if alcance changes
          if (patch.alcance !== undefined) {
            updated.emv_calculado = calcEMV(patch.alcance)
          }
          return updated
        })
        // Recalc person totals
        const realizados = posts.filter(post => post.status === 'publicado').length
        const emv_total = posts.reduce((sum, post) => sum + (post.emv_calculado || 0), 0)
        const boletas_atribuidas = posts.reduce((sum, post) => sum + (post.boletas_atribuidas || 0), 0)
        return { ...p, posts, publicaciones_realizadas: realizados, emv_total, boletas_atribuidas }
      })
    }))
  }, [persist])

  // ── Delete post ──
  const deletePost = useCallback((role, personId, postId) => {
    persist(prev => ({
      ...prev,
      [role + 's']: (prev[role + 's'] || []).map(p => {
        if (p.id !== personId) return p
        const posts = (p.posts || []).filter(post => post.id !== postId)
        const realizados = posts.filter(post => post.status === 'publicado').length
        const emv_total = posts.reduce((sum, post) => sum + (post.emv_calculado || 0), 0)
        return { ...p, posts, publicaciones_realizadas: realizados, emv_total }
      })
    }))
  }, [persist])

  // ── Computed stats ──
  const getCrewStats = useCallback(() => {
    const allPeople = [
      ...(crew.artistas || []),
      ...(crew.promotores || []),
      ...(crew.embajadores || [])
    ]
    const totalEmv = allPeople.reduce((s, p) => s + (p.emv_total || 0), 0)
    const totalBoletas = allPeople.reduce((s, p) => s + (p.boletas_atribuidas || 0), 0)
    const totalPosts = allPeople.reduce((s, p) => s + (p.publicaciones_realizadas || 0), 0)
    const totalPlaneados = allPeople.reduce((s, p) => s + (p.publicaciones_planeadas || 0), 0)
    return { totalEmv, totalBoletas, totalPosts, totalPlaneados }
  }, [crew])

  const resetToDefaults = useCallback(() => {
    save(DEFAULT_CREW)
    setCrew(DEFAULT_CREW)
  }, [])

  return {
    crew,
    addPerson,
    updatePerson,
    deletePerson,
    addPost,
    updatePost,
    deletePost,
    getCrewStats,
    resetToDefaults,
    CPM_REFERENCIA
  }
}
