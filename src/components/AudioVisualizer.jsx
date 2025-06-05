import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import './AudioVisualizer.css'

const AudioVisualizer = ({ isPlaying, getAudioData }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const linesRef = useRef([])
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Configuración de la escena
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 400 / 200, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(400, 200)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Posicionar cámara
    camera.position.z = 5

    // Crear líneas para la visualización
    const lineCount = 64
    const lines = []

    for (let i = 0; i < lineCount; i++) {
      const geometry = new THREE.BufferGeometry()
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL((i / lineCount) * 0.3 + 0.7, 0.8, 0.6),
        linewidth: 2
      })

      const positions = new Float32Array([
        (i - lineCount / 2) * 0.1, 0, 0,
        (i - lineCount / 2) * 0.1, 1, 0
      ])

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      lines.push(line)
    }

    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera
    linesRef.current = lines

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    const animate = () => {
      if (!isPlaying) {
        animationIdRef.current = requestAnimationFrame(animate)
        return
      }

      const audioData = getAudioData()
      
      if (audioData && linesRef.current.length > 0) {
        linesRef.current.forEach((line, index) => {
          const dataIndex = Math.floor((index / linesRef.current.length) * audioData.length)
          const amplitude = audioData[dataIndex] / 255
          
          // Actualizar la altura de la línea
          const positions = line.geometry.attributes.position.array
          positions[4] = amplitude * 3 // Y position del segundo punto
          line.geometry.attributes.position.needsUpdate = true
          
          // Cambiar color basado en la amplitud
          const hue = (index / linesRef.current.length) * 0.3 + 0.7
          const saturation = 0.8
          const lightness = 0.3 + amplitude * 0.7
          line.material.color.setHSL(hue, saturation, lightness)
        })
      } else {
        // Animación por defecto cuando no hay audio
        linesRef.current.forEach((line, index) => {
          const time = Date.now() * 0.001
          const amplitude = Math.sin(time * 2 + index * 0.1) * 0.5 + 0.5
          
          const positions = line.geometry.attributes.position.array
          positions[4] = amplitude * 1.5
          line.geometry.attributes.position.needsUpdate = true
          
          const hue = (index / linesRef.current.length) * 0.3 + 0.7
          const lightness = 0.3 + amplitude * 0.4
          line.material.color.setHSL(hue, 0.8, lightness)
        })
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
      
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isPlaying, getAudioData])

  return <div ref={mountRef} className="audio-visualizer" />
}

export default AudioVisualizer 