import { useEffect } from 'react'
import './App.css'
import { initSmoothScroll } from './lib/smoothScroll'
import BootOverlay from './components/BootOverlay'
import Hero from './components/Hero'
import Sections from './components/Sections'
import Cursor from './components/Cursor'
// Removed BackgroundFX in favor of bold pink bg + lava text

function App() {
  useEffect(() => {
    initSmoothScroll()
  }, [])

  return (
    <div>
      <BootOverlay />
      <Cursor />
      <Hero />
      <Sections />
    </div>
  )
}

export default App
