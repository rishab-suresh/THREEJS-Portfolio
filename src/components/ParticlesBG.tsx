import { useEffect, useRef } from 'react'

export default function ParticlesBG() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef({ x: 0, y: 0 })

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
        const dx = p.x - mouse.current.x
        const dy = p.y - mouse.current.y
        const dist = Math.hypot(dx, dy)
        if (dist < 140) {
          const f = (140 - dist) / 140
          p.vx += (dx / (dist + 0.0001)) * f * 0.06
          p.vy += (dy / (dist + 0.0001)) * f * 0.04
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.vy = p.vy * 0.985 + 0.002

        if (p.y > height + 20) { p.y = -10; p.x = Math.random() * width }
        if (p.x > width + 10) p.x = -10
        if (p.x < -10) p.x = width + 10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      const floaters = particles.filter((p) => p.floater)
      ctx.lineWidth = 1
      for (let i = 0; i < floaters.length; i++) {
        const a = floaters[i]
        const maxDist = 140
        const neighbors: { p: P; d2: number }[] = []
        for (let j = 0; j < particles.length; j++) {
          const b = particles[j]
          if (a === b) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < maxDist * maxDist) neighbors.push({ p: b, d2 })
        }
        neighbors.sort((m, n) => m.d2 - n.d2)
        const k = Math.min(4, neighbors.length)
        for (let n = 0; n < k; n++) {
          const d = Math.sqrt(neighbors[n].d2)
          const alpha = Math.max(0, 0.18 - (d / maxDist) * 0.18)
          ctx.strokeStyle = `rgba(0,0,0,${alpha})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(neighbors[n].p.x, neighbors[n].p.y)
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
    <div ref={wrapRef} className="work-bg">
      <canvas ref={canvasRef} />
    </div>
  )
}


