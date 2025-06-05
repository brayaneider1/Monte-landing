import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './AudioPlayer.css'

const AudioPlayer = forwardRef(({ onPlayingChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [currentSong, setCurrentSong] = useState(null)
  const [songTitle, setSongTitle] = useState('Drag a song here')
  const [isDragOver, setIsDragOver] = useState(false)
  
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // Exponer la referencia del audio al componente padre
  useImperativeHandle(ref, () => audioRef.current)

  useEffect(() => {
    const audio = audioRef.current
    
    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    if (audio) {
      audio.addEventListener('loadeddata', setAudioData)
      audio.addEventListener('timeupdate', setAudioTime)
      
      return () => {
        audio.removeEventListener('loadeddata', setAudioData)
        audio.removeEventListener('timeupdate', setAudioTime)
      }
    }
  }, [])

  // Notificar cambios de estado de reproducción
  useEffect(() => {
    console.log('🎵 AudioPlayer - isPlaying cambió a:', isPlaying)
    if (onPlayingChange) {
      onPlayingChange(isPlaying)
      console.log('🎵 AudioPlayer - Notificando cambio a padre:', isPlaying)
    }
  }, [isPlaying, onPlayingChange])

  // Visualizador personalizado con fondo transparente
  useEffect(() => {
    if (isPlaying && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      const draw = () => {
        if (!isPlaying) return

        // Fondo transparente - limpiar canvas completamente
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Simulación de barras basada en tiempo con múltiples frecuencias
        const time = Date.now() * 0.008
        const barCount = 40
        const barWidth = canvas.width / barCount
        const midPoint = canvas.height * 0.6 // Punto medio para el reflejo
        
        // Arrays para guardar las barras y crear el reflejo
        const bars = []
        
        for (let i = 0; i < barCount; i++) {
          // Múltiples ondas para más variación
          const wave1 = Math.sin(time + i * 0.3) * 0.5 + 0.5
          const wave2 = Math.sin(time * 1.5 + i * 0.2) * 0.3 + 0.3
          const wave3 = Math.sin(time * 0.7 + i * 0.8) * 0.2 + 0.2
          
          const barHeight = (wave1 + wave2 + wave3) * midPoint * 0.8
          
          // Colores en escala de blancos y grises claros
          const intensity = (barHeight / midPoint) * 255
          const grayValue = Math.max(150, Math.min(255, intensity + 100))
          
          // Variación sutil entre barras
          const variation = Math.sin(i * 0.5) * 20
          const finalGray = Math.max(120, Math.min(255, grayValue + variation))
          
          // Opacidad variable para más elegancia
          const opacity = 0.6 + (barHeight / midPoint) * 0.4
          
          bars.push({
            x: i * barWidth,
            height: barHeight,
            color: finalGray,
            opacity: opacity
          })
        }
        
        // Dibujar las barras principales (arriba)
        bars.forEach(bar => {
          ctx.fillStyle = `rgba(${bar.color}, ${bar.color}, ${bar.color}, ${bar.opacity})`
          ctx.fillRect(bar.x, midPoint - bar.height, barWidth - 2, bar.height)
        })
        
        // Dibujar el reflejo (abajo) - invertido y con menos opacidad
        bars.forEach(bar => {
          const reflectionHeight = bar.height * 0.7 // Reflejo más pequeño
          const reflectionOpacity = bar.opacity * 0.3 // Mucho más transparente
          
          // Gradiente para simular el efecto de agua
          const gradient = ctx.createLinearGradient(0, midPoint, 0, midPoint + reflectionHeight)
          gradient.addColorStop(0, `rgba(${bar.color}, ${bar.color}, ${bar.color}, ${reflectionOpacity})`)
          gradient.addColorStop(1, `rgba(${bar.color}, ${bar.color}, ${bar.color}, 0)`) // Se desvanece
          
          ctx.fillStyle = gradient
          ctx.fillRect(bar.x, midPoint, barWidth - 2, reflectionHeight)
        })
        
        // Línea de agua sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, midPoint)
        ctx.lineTo(canvas.width, midPoint)
        ctx.stroke()
        
        animationRef.current = requestAnimationFrame(draw)
      }
      
      draw()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      // Limpiar canvas cuando no está reproduciendo
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('audio/')) {
      // Pausar si está reproduciendo
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      }

      // Limpiar URL anterior
      if (currentSong && currentSong.startsWith('blob:')) {
        URL.revokeObjectURL(currentSong)
      }

      const url = URL.createObjectURL(file)
      setCurrentSong(url)
      setSongTitle(file.name.replace(/\.[^/.]+$/, ""))
      
      // Resetear audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load()
        }
      }, 50)
    } else {
      alert('Please select a valid audio file')
    }
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]
    handleFileUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(error => {
        console.log('Error playing audio:', error)
        setIsPlaying(false)
      })
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const clickX = e.nativeEvent.offsetX
    const width = e.currentTarget.offsetWidth
    const newTime = (clickX / width) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value
    setVolume(newVolume)
    audioRef.current.volume = newVolume
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={currentSong}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="song-info">
        <h3 className="song-title">{songTitle}</h3>
      </div>
      
      <div 
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="drop-content">
          <div className="drop-icon">🎵</div>
          <p>Drag your song here or click to select</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="audio/*"
          style={{ display: 'none' }}
        />
      </div>

      <div className="sound-graph">
        <canvas 
          ref={canvasRef} 
          width="300" 
          height="80"
          className="audio-canvas"
        />
      </div>
      
      <div className="player-controls">
        <button 
          className="play-pause-btn"
          onClick={togglePlayPause}
        >
          <span className="btn-icon">
            {isPlaying ? '⏸' : '▶'}
          </span>
        </button>
        
        <div className="progress-container">
          <span className="time">{formatTime(currentTime)}</span>
          <div 
            className="progress-bar"
            onClick={handleSeek}
          >
            <div 
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>
        
        <div className="volume-container">
          <span className="volume-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  )
})

export default AudioPlayer 