import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './AudioPlayer.css'

const AudioPlayer = forwardRef(({ onPlayingChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [currentSong, setCurrentSong] = useState(null)
  const [songTitle, setSongTitle] = useState('Selecciona una canción')

  const audioRef = useRef(null)
  const fileInputRef = useRef(null)

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

  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying)
    }
  }, [isPlaying, onPlayingChange])

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      }

      if (currentSong && currentSong.startsWith('blob:')) {
        URL.revokeObjectURL(currentSong)
      }

      const url = URL.createObjectURL(file)
      setCurrentSong(url)
      setSongTitle(file.name.replace(/\.[^/.]+$/, ""))

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load()
        }
      }, 50)
    }
  }

  const togglePlayPause = () => {
    const audio = audioRef.current

    if (!currentSong) {
      fileInputRef.current.click()
      return
    }

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
    if (!time || isNaN(time)) return '0:00'
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

      <div className="player-main">
        <button
          className="play-pause-btn"
          onClick={togglePlayPause}
          title={currentSong ? (isPlaying ? 'Pausar' : 'Reproducir') : 'Seleccionar canción'}
        >
          <span className="btn-icon">
            {isPlaying ? '⏸' : '▶'}
          </span>
        </button>

        <div className="song-info">
          <div className="song-title">{songTitle}</div>
        </div>

        <div className="time-display">{formatTime(currentTime)}</div>

        <div
          className="progress-bar"
          onClick={handleSeek}
        >
          <div
            className="progress-fill"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="time-display">{formatTime(duration)}</div>

        <div className="volume-container">
          <span className="volume-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <button
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
          title="Cargar canción"
        >
          📁
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="audio/*"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
})

AudioPlayer.displayName = 'AudioPlayer'

export default AudioPlayer