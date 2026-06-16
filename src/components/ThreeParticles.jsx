import { useEffect, useRef } from 'react'

/**
 * OrganicParticles — replaces geometric wireframe spheres with
 * bioluminescent spores / fireflies / floating leaves that feel
 * like SELVÁTICA (jungle, dusk, humid heat) and MONTE (deep forest, mist).
 *
 * Uses plain Canvas 2D for zero-overhead organic aesthetics.
 */
const ThreeParticles = ({ audioRef, isPlaying, theme = 'selvatica' }) => {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({ isPlaying, theme })
  const analyserRef  = useRef(null)
  const dataArrayRef = useRef(null)
  const frameRef     = useRef(null)

  // Keep refs in sync without restarting the animation loop
  useEffect(() => { stateRef.current.isPlaying = isPlaying }, [isPlaying])
  useEffect(() => { stateRef.current.theme = theme },       [theme])

  /* ── AUDIO ANALYSER ── */
  useEffect(() => {
    if (audioRef?.current && isPlaying && !analyserRef.current) {
      const timer = setTimeout(() => {
        try {
          const ctx     = new (window.AudioContext || window.webkitAudioContext)()
          if (ctx.state === 'suspended') ctx.resume()
          const analyser = ctx.createAnalyser()
          const source   = ctx.createMediaElementSource(audioRef.current)
          source.connect(analyser)
          analyser.connect(ctx.destination)
          analyser.fftSize              = 256
          analyser.smoothingTimeConstant = 0.8
          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          analyserRef.current  = analyser
          dataArrayRef.current = dataArray
        } catch (e) {
          console.warn('Audio analyser:', e)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [audioRef, isPlaying])

  /* ── MAIN CANVAS LOOP ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx2d = canvas.getContext('2d')

    /* resize helper */
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── PARTICLE FACTORY ── */
    const isMobile  = window.innerWidth <= 768
    const COUNT     = isMobile ? 55 : 110

    const rand  = (a, b) => Math.random() * (b - a) + a
    const tau   = Math.PI * 2

    /* Particle shape types */
    const SHAPES = ['spore', 'leaf', 'tendril', 'glow']

    function makeParticle() {
      const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)]
      const size   = shape === 'tendril'
        ? rand(12, 40)
        : shape === 'leaf'
          ? rand(5, 16)
          : rand(2, 9)

      return {
        x:       rand(0, canvas.width),
        y:       rand(0, canvas.height),
        vx:      rand(-0.18, 0.18),
        vy:      rand(-0.35, -0.05),       // gentle upward drift
        drift:   rand(0, tau),              // sinusoidal side drift phase
        driftAmp: rand(0.2, 1.0),
        driftFreq: rand(0.3, 1.2),
        size,
        baseSize: size,
        opacity: rand(0.25, 0.9),
        baseOpacity: rand(0.25, 0.9),
        rotation: rand(0, tau),
        rotSpeed: rand(-0.008, 0.008),
        shape,
        pulse:   rand(0, tau),             // pulsation phase
        pulseFreq: rand(0.5, 2.0),
      }
    }

    const particles = Array.from({ length: COUNT }, makeParticle)

    /* ── THEME COLOR LOOKUP ── */
    function themeColors(t) {
      if (t === 'monte') {
        return {
          primary:   '#d4af37',   // gold
          secondary: '#10b981',   // emerald
          accent:    '#a3e635',   // lime
          fog:       'rgba(5,24,15,0.08)',
        }
      }
      // selvatica (default)
      return {
        primary:   '#59ff00',   // acid green
        secondary: '#00d0ff',   // morpho blue
        accent:    '#ff5500',   // neon orange
        fog:       'rgba(244,243,239,0.06)',
      }
    }

    /* ── DRAW HELPERS ── */

    function drawSpore(c, p, col, audioBump) {
      const r = p.size * (1 + audioBump * 0.8)
      c.beginPath()
      c.arc(0, 0, r, 0, tau)
      // inner glow core
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, r)
      grad.addColorStop(0,   col.primary + 'ff')
      grad.addColorStop(0.4, col.primary + '88')
      grad.addColorStop(1,   col.primary + '00')
      c.fillStyle = grad
      c.fill()

      // outer halo
      c.beginPath()
      c.arc(0, 0, r * 2.5, 0, tau)
      const halo = c.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.5)
      halo.addColorStop(0, col.secondary + '30')
      halo.addColorStop(1, col.secondary + '00')
      c.fillStyle = halo
      c.fill()
    }

    function drawLeaf(c, p, col, audioBump) {
      const l = p.size * (1 + audioBump * 0.4) * 2.5
      const w = l * 0.45
      c.beginPath()
      c.moveTo(0, -l / 2)
      c.bezierCurveTo( w, -l * 0.1,  w,  l * 0.2, 0,  l / 2)
      c.bezierCurveTo(-w,  l * 0.2, -w, -l * 0.1, 0, -l / 2)
      c.closePath()
      c.fillStyle = col.secondary + Math.floor(p.opacity * 180).toString(16).padStart(2,'0')
      c.fill()

      // central vein
      c.beginPath()
      c.moveTo(0, -l / 2)
      c.lineTo(0,  l / 2)
      c.strokeStyle = col.accent + '55'
      c.lineWidth   = 0.8
      c.stroke()
    }

    function drawTendril(c, p, col, audioBump) {
      const len = p.size * (1 + audioBump * 0.5)
      const segs = 6
      c.beginPath()
      c.moveTo(0, 0)
      let cx = 0, cy = 0
      for (let i = 1; i <= segs; i++) {
        const t2 = i / segs
        const angle = (p.pulse + t2 * Math.PI * 1.8) * (p.rotSpeed > 0 ? 1 : -1)
        const sx = Math.cos(angle) * len * 0.35
        const sy = -len * t2
        c.bezierCurveTo(cx + sx, cy - len * 0.2, sx, sy + len * 0.1, sx, sy)
        cx = sx; cy = sy
      }
      c.strokeStyle = col.primary + Math.floor(p.opacity * 200).toString(16).padStart(2,'0')
      c.lineWidth   = Math.max(0.5, p.size * 0.06)
      c.lineCap     = 'round'
      c.stroke()
    }

    function drawGlow(c, p, col, audioBump) {
      const r = p.size * (1 + audioBump * 1.2)
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, r * 3)
      grad.addColorStop(0,   col.accent + 'dd')
      grad.addColorStop(0.3, col.accent + '55')
      grad.addColorStop(1,   col.accent + '00')
      c.beginPath()
      c.arc(0, 0, r * 3, 0, tau)
      c.fillStyle = grad
      c.fill()
    }

    /* ── ANIMATION LOOP ── */
    let lastTime = 0

    function loop(now) {
      frameRef.current = requestAnimationFrame(loop)

      const dt = Math.min((now - lastTime) / 16.67, 3)  // cap at 3× slowdown
      lastTime = now

      const { isPlaying: playing, theme: t } = stateRef.current
      const colors = themeColors(t)

      /* audio sample */
      let audioBump = 0
      if (analyserRef.current && dataArrayRef.current && playing) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
        audioBump = sum / (dataArrayRef.current.length * 255)
      }
      if (playing && audioBump === 0) {
        audioBump = Math.abs(Math.sin(now * 0.001)) * 0.3 + 0.05
      }

      /* clear with very subtle fog trail */
      ctx2d.fillStyle = colors.fog
      ctx2d.fillRect(0, 0, canvas.width, canvas.height)

      const wH = canvas.height

      particles.forEach((p) => {
        /* update position */
        p.pulse    += p.pulseFreq * 0.018 * dt
        p.drift    += p.driftFreq * 0.012 * dt
        p.rotation += p.rotSpeed * dt

        const speedMult = playing ? 1 + audioBump * 2.5 : 1
        p.x += (p.vx + Math.sin(p.drift) * p.driftAmp * 0.4) * dt * speedMult
        p.y += p.vy * dt * speedMult

        /* wrap around edges */
        if (p.y < -60)              { p.y = wH + 30; p.x = rand(0, canvas.width) }
        if (p.y > wH + 60)          { p.y = -30 }
        if (p.x < -80)              p.x = canvas.width + 40
        if (p.x > canvas.width + 80) p.x = -40

        /* pulsating opacity */
        p.opacity = p.baseOpacity * (0.7 + Math.sin(p.pulse) * 0.3)
        if (playing) p.opacity = Math.min(1, p.opacity + audioBump * 0.3)

        /* draw */
        ctx2d.save()
        ctx2d.globalAlpha = p.opacity
        ctx2d.translate(p.x, p.y)
        ctx2d.rotate(p.rotation)

        switch (p.shape) {
          case 'spore':   drawSpore(ctx2d, p, colors, audioBump); break
          case 'leaf':    drawLeaf(ctx2d, p, colors, audioBump);  break
          case 'tendril': drawTendril(ctx2d, p, colors, audioBump); break
          case 'glow':    drawGlow(ctx2d, p, colors, audioBump);  break
        }

        ctx2d.restore()
      })
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])  // single mount — state via refs

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default ThreeParticles