import { useRef, useState } from 'react'
import AudioPlayer from './components/AudioPlayer'
import ThreeParticles from './components/ThreeParticles'
import './App.css'

function App() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayingChange = (playing) => {
    setIsPlaying(playing)
  }

  return (
    <div className="app">
      <ThreeParticles audioRef={audioRef} isPlaying={isPlaying} />
      <div className="content">
        <div className="title-container">
          <h1 className="title">MONTE</h1>
        </div>
        <div className="audio-player-container">
          <AudioPlayer 
            ref={audioRef} 
            onPlayingChange={handlePlayingChange}
          />
        </div>
      </div>
    </div>
  )
}

export default App
