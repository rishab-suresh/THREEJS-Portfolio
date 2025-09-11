import { useEffect, useMemo, useRef, useState } from 'react'

type Vibe = {
  key: string
  label: string
  hue: number
  desc: string
}

export default function About() {
  const vibes = useMemo<Vibe[]>(() => [
    { key: 'webgl', label: 'WebGL', hue: 210, desc: 'I craft lightweight shader tricks and immersive visuals without compromising performance.' },
    { key: 'motion', label: 'Motion', hue: 320, desc: 'Crisp timelines, scroll choreography, and interactions that feel inevitable.' },
    { key: 'ui', label: 'UI', hue: 45, desc: 'Beautiful, legible, and fast. Systems that scale and micro-interactions that delight.' },
    { key: 'systems', label: 'Systems', hue: 160, desc: 'Organized code, clean data flow, and pragmatic tradeoffs to ship reliably.' },
  ], [])
  const [active, setActive] = useState<Vibe>(vibes[0])

  return (
    <section id="about" className="section section-about">
      <Particles hue={active.hue} />
      <div className="container about">
        <div className="about-col">
          <h2>About</h2>
          <Typewriter className="about-bio" text="Creative engineer focused on motion, web, and expressive UI." speed={18} />
          <div className="vibes">
            <div className="vibe-tags">
              {vibes.map((v) => (
                <button
                  key={v.key}
                  className={`vibe-tag${active.key === v.key ? ' is-active' : ''}`}
                  style={{ ['--hue' as any]: v.hue } as any}
                  onClick={() => setActive(v)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="vibe-meter" aria-hidden>
              <div className="vibe-meter-fill" style={{ ['--hue' as any]: active.hue } as any} />
            </div>
            <Typewriter key={active.key} className="vibe-desc" text={active.desc} speed={14} />
          </div>
        </div>
        <div className="about-col">
          <h3>Highlights</h3>
          <ul>
            <li>Shipped interactive landings and micro-sites with performance budgets</li>
            <li>Built reusable motion patterns and design-system friendly components</li>
            <li>Comfortable across React, GSAP, and modern CSS</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

type TWProps = { text: string; speed?: number; className?: string }
function Typewriter({ text, speed = 22, className }: TWProps) {
  const [i, setI] = useState(0)
  useEffect(() => {
    setI(0)
    let raf = 0
    let last = performance.now()
    const perChar = Math.max(8, speed)
    const tick = (t: number) => {
      if (i >= text.length) return
      if (t - last >= perChar) {
        setI((v) => Math.min(text.length, v + 1))
        last = t
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed])
  return (
    <p className={className}>
      <span>{text.slice(0, i)}</span>
      <span className="type-caret" aria-hidden>
        |
      </span>
    </p>
  )
}

function Particles({ hue = 200 }: { hue?: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const hueRef = useRef(hue)
  hueRef.current = hue

  useEffect(() => {
    const wrap = wrapRef.current!
    const c = canvasRef.current!
    const ctx = c.getContext('2d', { alpha: true })!
    let raf = 0
    let width = 0
    let height = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    type P = { x: number; y: number; vx: number; vy: number; r: number; floater: boolean }
    let particles: P[] = []

    function resize() {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      c.width = Math.floor(width * dpr)
      c.height = Math.floor(height * dpr)
      c.style.width = width + 'px'
      c.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    function init() {
      const count = Math.max(120, Math.floor((width * height) / 9000))
      particles = new Array(count).fill(0).map(() => {
        const floater = Math.random() < 0.12
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.35 + Math.random() * 0.6,
          r: floater ? 2.2 + Math.random() * 1.8 : 0.9 + Math.random() * 1.8,
          floater,
        }
      })
    }

    function step() {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      for (let p of particles) {
        // Mouse influence
        const dx = p.x - mouse.current.x
        const dy = p.y - mouse.current.y
        const dist = Math.hypot(dx, dy)
        if (dist < 140) {
          const f = (140 - dist) / 140
          p.vx += (dx / (dist + 0.0001)) * f * 0.06
          p.vy += (dy / (dist + 0.0001)) * f * 0.04
        }

        // Integrate
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.vy = p.vy * 0.985 + 0.002

        // Wrap
        if (p.y > height + 20) { p.y = -10; p.x = Math.random() * width }
        if (p.x > width + 10) p.x = -10
        if (p.x < -10) p.x = width + 10

        // Render particle (black on white)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Faint connecting lines between a few floaters and nearby neighbors
      const floaters = particles.filter((p) => p.floater)
      ctx.lineWidth = 1
      for (let i = 0; i < floaters.length; i++) {
        const a = floaters[i]
        // Find up to 4 nearest neighbors within max distance
        const maxDist = 140
        const neighbors: { p: P; d2: number }[] = []
        for (let j = 0; j < particles.length; j++) {
          const b = particles[j]
          if (a === b) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < maxDist * maxDist) {
            neighbors.push({ p: b, d2 })
          }
        }
        neighbors.sort((m, n) => m.d2 - n.d2)
        const k = Math.min(4, neighbors.length)
        for (let n = 0; n < k; n++) {
          const b = neighbors[n].p
          const d = Math.sqrt(neighbors[n].d2)
          const alpha = Math.max(0, 0.18 - (d / maxDist) * 0.18)
          ctx.strokeStyle = `hsla(${hueRef.current}, 80%, 45%, ${alpha})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
      raf = requestAnimationFrame(step)
    }

    function onMove(e: MouseEvent) {
      const rect = wrap.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
    }

    window.addEventListener('mousemove', onMove)
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()
    raf = requestAnimationFrame(step)
    return () => {
      window.removeEventListener('mousemove', onMove)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={wrapRef} className="about-bg">
      <canvas ref={canvasRef} />
    </div>
  )
}



