import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'

const COLORS = ['#ff004c', '#ff7a00', '#ffd400', '#35d07f', '#1da1f2', '#6f42c1', '#b517ff']

type Drop = {
  id: string
  color: string
  width: number
  heightVh: number
  delay: number
  xPct: number
}

function useDrops(count: number) {
  return useMemo<Drop[]>(() => {
    const cols = 16
    return Array.from({ length: count }).map((_, i) => {
      const bin = i % cols
      const binWidth = 100 / cols
      const jitter = Math.random() * 0.8 + 0.1 // keep a little margin within the bin
      let xPct = (bin + jitter) * binWidth
      // clamp away from extreme edges so center-offset doesn't clip
      xPct = Math.max(2, Math.min(98, xPct))
      return {
        id: `d-${i}`,
        color: COLORS[i % COLORS.length],
        width: 4 + Math.round(Math.random() * 7),
        heightVh: 10 + Math.round(Math.random() * 16),
        delay: Math.random() * 6,
        xPct,
      }
    })
  }, [count])
}

export default function RainbowWalls() {
  const fieldRef = useRef<HTMLDivElement>(null)
  const drops = useDrops(90)
  const animsRef = useRef<gsap.core.Tween[]>([])

  useEffect(() => {
    const anims: gsap.core.Tween[] = []
    if (!fieldRef.current) return
    const els = Array.from(fieldRef.current.querySelectorAll<HTMLElement>('.rainbow-drop'))
    els.forEach((el, i) => {
      const yDur = 10 + Math.random() * 12
      const sway = 8 + Math.random() * 10
      const xDir = i % 2 === 0 ? 1 : -1
      const delay = Number(el.dataset.delay || '0')

      anims.push(
        gsap.fromTo(
          el,
          { y: '-40vh' },
          { y: '140vh', duration: yDur, ease: 'none', repeat: -1, delay }
        )
      )
      anims.push(
        gsap.to(el, { x: xDir * sway, yoyo: true, repeat: -1, duration: 1.8 + Math.random(), ease: 'sine.inOut' })
      )
      anims.push(
        gsap.to(el, { scaleY: 1.3, yoyo: true, repeat: -1, duration: 1.1 + Math.random(), ease: 'sine.inOut' })
      )
    })
    animsRef.current = anims

    function onMove(e: MouseEvent) {
      const nx = Math.abs(e.clientX / window.innerWidth - 0.5)
      const ny = Math.abs(e.clientY / window.innerHeight - 0.5)
      const factor = 1 + Math.min(0.5, Math.max(nx, ny)) * 2.2
      animsRef.current.forEach((t) => t.timeScale(factor))
    }

    let resetTween: gsap.core.Tween | null = null
    function onWheel(e: WheelEvent) {
      const intensity = Math.min(1, Math.abs(e.deltaY) / 600)
      const factor = 1 + intensity * 2.4
      animsRef.current.forEach((t) => t.timeScale(factor))
      resetTween?.kill()
      resetTween = gsap.to({}, {
        duration: 0.8,
        onUpdate: () => animsRef.current.forEach((t) => t.timeScale(1 + (1 - (resetTween!.progress())) * (factor - 1))),
        onComplete: () => animsRef.current.forEach((t) => t.timeScale(1))
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('wheel', onWheel)
      anims.forEach((a) => a.kill())
      resetTween?.kill()
    }
  }, [])

  return (
    <div ref={fieldRef} className="rainbow-field">
      {drops.map((d) => (
        <div
          key={d.id}
          className="rainbow-drop"
          data-delay={d.delay}
          style={{
            top: `-10vh`,
            left: `${d.xPct}%`,
            width: `${Math.max(6, d.width)}px`,
            height: `${Math.max(14, d.heightVh)}vh`,
            transform: 'translateX(-50%)',
            background: `linear-gradient(180deg, rgba(255,255,255,0.18) 0%, ${d.color} 20%, ${d.color} 88%, rgba(0,0,0,0) 100%)`,
            boxShadow: `0 0 18px ${d.color}55, 0 0 36px ${d.color}33`,
            opacity: 0.95,
          }}
        />
      ))}
    </div>
  )
}


