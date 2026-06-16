import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './AudioPlayer.css'

/**
 * RadioPlayer — compact floating radio widget
 * Streams SomaFM channels: 100% free, no ads, license-cleared.
 * Positioned bottom-right corner, minimal footprint.
 */

const STATIONS = [
  {
    id: 'groovesalad',
    name: 'Groove Salad',
    desc: 'Ambient / Electronic',
    url: 'https://ice2.somafm.com/groovesalad-128-mp3',
    color: '#59ff00',
  },
  {
    id: 'deepspace',
    name: 'Deep Space One',
    desc: 'Deep / Atmospheric',
    url: 'https://ice2.somafm.com/deepspaceone-128-mp3',
    color: '#00d0ff',
  },
  {
    id: 'fluid',
    name: 'Fluid',
    desc: 'Ambient House',
    url: 'https://ice2.somafm.com/fluid-128-mp3',
    color: '#ff5500',
  },
  {
    id: 'dronezone',
    name: 'Drone Zone',
    desc: 'Dark Ambient',
    url: 'https://ice2.somafm.com/dronezone-128-mp3',
    color: '#a3e635',
  },
]

const AudioPlayer = forwardRef(({ onPlayingChange }, ref) => {
  const [isPlaying, setIsPlaying]     = useState(false)
  const [stationIdx, setStationIdx]   = useState(0)
  const [volume, setVolume]           = useState(0.6)
  const [expanded, setExpanded]       = useState(false)
  const [loading, setLoading]         = useState(false)

  const audioRef = useRef(null)

  // Expose the audio element so ThreeParticles can read it
  useImperativeHandle(ref, () => audioRef.current)

  const station = STATIONS[stationIdx]

  // Notify parent of playing state
  useEffect(() => {
    onPlayingChange?.(isPlaying)
  }, [isPlaying, onPlayingChange])

  // When station changes, reload and resume if was playing
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const wasPlaying = isPlaying
    audio.pause()
    audio.load()
    if (wasPlaying) {
      setLoading(true)
      audio.play()
        .then(() => { setIsPlaying(true); setLoading(false) })
        .catch(() => { setIsPlaying(false); setLoading(false) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationIdx])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      setLoading(true)
      audio.play()
        .then(() => { setIsPlaying(true); setLoading(false) })
        .catch(() => { setIsPlaying(false); setLoading(false) })
    }
  }

  const selectStation = (idx) => {
    if (idx === stationIdx) return
    setStationIdx(idx)
    setExpanded(false)
  }

  return (
    <div className={`radio-widget ${expanded ? 'radio-expanded' : ''}`}
         style={{ '--station-color': station.color }}>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={station.url}
        preload="none"
        onWaiting={() => setLoading(true)}
        onPlaying={() => { setLoading(false); setIsPlaying(true) }}
        onPause={() => setIsPlaying(false)}
        onError={() => { setLoading(false); setIsPlaying(false) }}
      />

      {/* ── COMPACT BAR ── */}
      <div className="radio-bar">

        {/* Play / Pause */}
        <button
          className={`radio-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {loading
            ? <span className="radio-spinner" />
            : <span>{isPlaying ? '■' : '▶'}</span>
          }
        </button>

        {/* Station info */}
        <button className="radio-info" onClick={() => setExpanded(e => !e)}>
          <span className="radio-live-dot" style={{ opacity: isPlaying ? 1 : 0.3 }} />
          <span className="radio-station-name">{station.name}</span>
          <span className="radio-station-desc">{station.desc}</span>
        </button>

        {/* Volume */}
        <label className="radio-vol-wrap" aria-label="Volumen">
          <span className="radio-vol-icon">{volume === 0 ? '🔇' : '▲'}</span>
          <input
            type="range"
            min="0" max="1" step="0.02"
            value={volume}
            onChange={e => setVolume(+e.target.value)}
            className="radio-vol-slider"
          />
        </label>

        {/* Expand toggle */}
        <button
          className="radio-expand-btn"
          onClick={() => setExpanded(e => !e)}
          aria-label="Cambiar estación"
        >
          {expanded ? '×' : '≡'}
        </button>
      </div>

      {/* ── STATION PICKER (expanded) ── */}
      {expanded && (
        <div className="radio-station-list">
          <p className="radio-list-header">— SomaFM / Seleccionar canal —</p>
          {STATIONS.map((s, i) => (
            <button
              key={s.id}
              className={`radio-station-item ${i === stationIdx ? 'active' : ''}`}
              style={{ '--sc': s.color }}
              onClick={() => selectStation(i)}
            >
              <span className="rsi-dot" />
              <span className="rsi-name">{s.name}</span>
              <span className="rsi-desc">{s.desc}</span>
            </button>
          ))}
          <a
            href="https://somafm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="radio-credit"
          >
            SomaFM — free radio ↗
          </a>
        </div>
      )}
    </div>
  )
})

AudioPlayer.displayName = 'RadioPlayer'
export default AudioPlayer