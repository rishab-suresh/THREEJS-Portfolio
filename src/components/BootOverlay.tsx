import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function BootOverlay() {
  const [done, setDone] = useState(false)
  const linesRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    const lines = [
      '“Art enables us to find ourselves and lose ourselves at the same time.”',
      '— Thomas Merton',
    ]
    // Show Welcome immediately
    tl.set(headerRef.current, { opacity: 0 }, 0)
    tl.to(headerRef.current, { opacity: 1, duration: 0.6 }, 0)
    if (linesRef.current) {
      linesRef.current.innerHTML = ''
      // After 5s, reveal the quote lines
      const quoteStart = 5
      lines.forEach((t, i) => {
        const el = document.createElement('div')
        el.textContent = t
        el.className = 'boot-line'
        el.style.opacity = '0'
        linesRef.current!.appendChild(el)
        tl.to(el, { opacity: 1 }, quoteStart + i * 0.08)
      })
    }
    // Fade overlay out 2.5s after the last quote line appears
    const quoteStart = 5
    const lastLineTime = quoteStart + Math.max(0, (lines.length - 1)) * 0.08
    const overlayFadeStart = lastLineTime + 2.5
    tl.to(overlayRef.current, { opacity: 0, duration: 0.6 }, overlayFadeStart).add(() => setDone(true))
    return () => { tl.kill() }
  }, [])

  if (done) return null

  return (
    <div ref={overlayRef} className="boot-overlay">
      <div className="boot-viewport">
        <div ref={headerRef} className="boot-header">Welcome</div>
        <div ref={linesRef} className="boot-lines" />
      </div>
    </div>
  )
}


