import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const ThreeParticles = ({ audioRef, isPlaying }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const spheresRef = useRef([])
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const isPlayingRef = useRef(isPlaying) // Referencia para capturar el valor actual
  const flybyRef = useRef({ 
    active: false, 
    sphere: null, 
    startTime: 0, 
    originalPosition: null, 
    originalScale: null,
    originalVelocity: null,
    lastFlybyTime: Date.now(),
    queue: [], // Cola de esferas para flyby secuencial
    currentIndex: 0,
    waitingForNext: false,
    nextFlybyTime: 0
  })

  // DEBUG: Ver qué está pasando con isPlaying
  console.log('🔍 ThreeParticles renderizado - isPlaying:', isPlaying)

  useEffect(() => {
    console.log('🔍 isPlaying cambió a:', isPlaying)
    isPlayingRef.current = isPlaying // Actualizar la referencia
  }, [isPlaying])

  useEffect(() => {
    if (!mountRef.current) return

    // Configuración de la escena
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Crear esferas 3D huecas - Optimizado para móviles
    const spheres = []
    const isMobile = window.innerWidth <= 768
    const sphereCount = isMobile ? 8 : 15 // Menos esferas en móvil

    for (let i = 0; i < sphereCount; i++) {
      // Geometría de esfera con wireframe - Tamaño optimizado para móvil
      const baseSize = isMobile ? 0.15 : 0.2
      const geometry = new THREE.SphereGeometry(baseSize + Math.random() * (isMobile ? 0.2 : 0.3), 8, 6)
      
      // Colores en escala de grises
      const grayScale = Math.random()
      const grayColor = new THREE.Color(grayScale, grayScale, grayScale)
      
      const material = new THREE.MeshBasicMaterial({
        color: grayColor,
        wireframe: true,
        transparent: true,
        opacity: isMobile ? 0.7 : 0.6 // Más visibles en móvil
      })
      
      const sphere = new THREE.Mesh(geometry, material)
      
      // Posición aleatoria - Más centrada para móvil
      const xRange = isMobile ? 12 : 16
      const yRange = isMobile ? 8 : 10
      const zRange = isMobile ? 6 : 8
      
      sphere.position.x = (Math.random() - 0.5) * xRange
      sphere.position.y = (Math.random() - 0.5) * yRange
      sphere.position.z = (Math.random() - 0.5) * zRange
      
      // Guardar las posiciones originales de los vértices
      const originalPositions = geometry.attributes.position.array.slice()
      
      // Velocidad aleatoria en TODOS los ejes incluyendo Z
      sphere.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04, // Velocidad X más rápida
          (Math.random() - 0.5) * 0.04, // Velocidad Y más rápida
          (Math.random() - 0.5) * 0.06  // Velocidad Z para acercarse/alejarse
        ),
        originalScale: sphere.scale.clone(),
        originalColor: grayColor.clone(),
        originalPositions: originalPositions,
        morphProgress: 0, // 0 = esfera, 1 = hexágono
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.03
        },
        originalPosition: sphere.position.clone(),
        originalVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.06
        ),
        // Determinar si esta esfera tiene movimiento constante
        hasConstantMovement: i < Math.floor(sphereCount / 2), // La mitad de las esferas
        baseDistance: Math.random() * 3 + 2, // Distancia base del centro (2-5)
        orbitSpeed: (Math.random() - 0.5) * 0.01, // Velocidad de órbita
        currentAngle: Math.random() * Math.PI * 2 // Ángulo inicial aleatorio
      }
      
      scene.add(sphere)
      spheres.push(sphere)
    }

    camera.position.z = 8
    
    sceneRef.current = scene
    rendererRef.current = renderer
    spheresRef.current = spheres
    
    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate)

      const currentlyPlaying = isPlayingRef.current
      console.log('🔄 Animate - isPlaying:', currentlyPlaying)

      // Obtener datos de audio reales
      let audioData = 0
      if (analyserRef.current && dataArrayRef.current && currentlyPlaying) {
        try {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current)
          const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
          audioData = sum / (dataArrayRef.current.length * 255)
          console.log('🎵 Audio real detectado:', audioData.toFixed(3))
        } catch (error) {
          console.log('❌ Error obteniendo audio:', error)
          audioData = 0
        }
      }

      // Fallback SIMPLE si no hay audio real
      if (currentlyPlaying && audioData === 0) {
        const time = Date.now() * 0.001
        audioData = Math.abs(Math.sin(time)) * 0.5 + 0.2
        console.log('🔄 Usando fallback, audioData:', audioData.toFixed(3))
      }

      // Animar TODAS las esferas con movimiento libre en todos los ejes
      spheres.forEach((sphere, index) => {
        
        // ESFERAS CON MOVIMIENTO CONSTANTE (mitad de las esferas)
        if (sphere.userData.hasConstantMovement) {
          // Movimiento orbital constante alrededor del centro
          sphere.userData.currentAngle += sphere.userData.orbitSpeed
          
          // Distancia variable basada en audio
          let distanceMultiplier = 1
          if (currentlyPlaying && audioData > 0) {
            // Sincronización con audio: se acercan más cuando hay más audio
            distanceMultiplier = 1 - (audioData * 0.7) // Se acercan hasta 70% más
          }
          
          const distance = sphere.userData.baseDistance * distanceMultiplier
          
          // Posición orbital
          sphere.position.x = Math.cos(sphere.userData.currentAngle) * distance
          sphere.position.y = Math.sin(sphere.userData.currentAngle) * distance * 0.6 // Órbita más elíptica
          
          // Movimiento en Z sincronizado con audio - MÁS DRAMÁTICO
          if (currentlyPlaying && audioData > 0) {
            sphere.position.z = Math.sin(sphere.userData.currentAngle * 2) * audioData * 20 + 5 // Mucho más acercamiento
          } else {
            sphere.position.z = Math.sin(sphere.userData.currentAngle * 2) * 8 + 5 // Movimiento Z más amplio
          }
          
          // Rotación constante
          sphere.rotation.x += sphere.userData.rotationSpeed.x * 2
          sphere.rotation.y += sphere.userData.rotationSpeed.y * 2
          sphere.rotation.z += sphere.userData.rotationSpeed.z * 2
          
          // Escala y brillo sincronizado con audio
          if (currentlyPlaying && audioData > 0) {
            const audioScale = 1 + audioData * 0.8
            sphere.scale.setScalar(audioScale)
            sphere.material.opacity = 0.5 + audioData * 0.5
            const brightness = 0.4 + audioData * 0.6
            sphere.material.color.setRGB(brightness, brightness, brightness)
          } else {
            sphere.scale.setScalar(1)
            sphere.material.opacity = 0.6
            sphere.material.color.copy(sphere.userData.originalColor)
          }
          
        } else {
          // ESFERAS CON MOVIMIENTO LIBRE EN TODOS LOS EJES
          // Movimiento libre en X, Y, Z
          sphere.position.add(sphere.userData.velocity)
          
          // Rebote en los bordes - INCLUYENDO EJE Z MUY CERCA
          const xLimit = isMobile ? 8 : 12
          const yLimit = isMobile ? 6 : 8
          const zLimit = isMobile ? 25 : 35 // Límites Z MUY amplios para acercarse extremadamente
          const zMin = isMobile ? -2 : -1 // Muy cerca de la cámara (casi tocando)
          
          if (sphere.position.x > xLimit || sphere.position.x < -xLimit) {
            sphere.userData.velocity.x *= -1
          }
          if (sphere.position.y > yLimit || sphere.position.y < -yLimit) {
            sphere.userData.velocity.y *= -1
          }
          if (sphere.position.z > zLimit || sphere.position.z < zMin) {
            sphere.userData.velocity.z *= -1
          }
          
          // Escalado dinámico basado en proximidad a la cámara - MÁS EXTREMO
          const distanceFromCamera = Math.abs(sphere.position.z - 8) // Cámara está en Z=8
          const proximityScale = Math.max(0.3, Math.min(15, 50 / (distanceFromCamera + 0.5))) // Escala más extrema
          
          // Rotación
          sphere.rotation.x += sphere.userData.rotationSpeed.x
          sphere.rotation.y += sphere.userData.rotationSpeed.y
          sphere.rotation.z += sphere.userData.rotationSpeed.z
          
          // REACCIÓN AL AUDIO + PROXIMIDAD
          if (currentlyPlaying && audioData > 0) {
            // Cambio de tamaño basado en audio Y proximidad
            const targetScale = proximityScale * (1 + audioData * 0.6)
            sphere.scale.setScalar(targetScale)
            
            // Opacidad más dramática
            sphere.material.opacity = 0.4 + audioData * 0.6
            
            // Cambio de color en escala de grises
            const brightness = 0.3 + audioData * 0.7 // De gris oscuro a blanco
            sphere.material.color.setRGB(brightness, brightness, brightness)
            
          } else {
            // Estado normal con escala de proximidad
            sphere.scale.setScalar(proximityScale)
            sphere.material.opacity = 0.6
            sphere.material.color.copy(sphere.userData.originalColor)
          }
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    // Manejar redimensionamiento
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      spheres.forEach(sphere => {
        sphere.geometry.dispose()
        sphere.material.dispose()
      })
    }
  }, [])

  // Configurar AudioContext cuando se reproduzca música
  useEffect(() => {
    if (audioRef?.current && isPlaying && !analyserRef.current) {
      // Pequeño delay para asegurar que el audio esté reproduciéndose
      const timer = setTimeout(() => {
        try {
          console.log('Configurando AudioContext...')
          const audioContext = new (window.AudioContext || window.webkitAudioContext)()
          
          // Reanudar contexto si está suspendido
          if (audioContext.state === 'suspended') {
            audioContext.resume()
          }
          
          const analyser = audioContext.createAnalyser()
          const source = audioContext.createMediaElementSource(audioRef.current)
          
          source.connect(analyser)
          analyser.connect(audioContext.destination)
          
          analyser.fftSize = 256
          analyser.smoothingTimeConstant = 0.8
          const bufferLength = analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          
          analyserRef.current = analyser
          dataArrayRef.current = dataArray
          
          console.log('Audio analyser configurado correctamente')
        } catch (error) {
          console.log('Error configurando audio analyser:', error)
          // Mantener simulación si falla
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [audioRef, isPlaying])

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible'
      }}
    />
  )
}

export default ThreeParticles 