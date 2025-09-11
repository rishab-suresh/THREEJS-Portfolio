import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current!
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y
    let raf = 0

    function onMove(e: MouseEvent) {
      tx = e.clientX
      ty = e.clientY
    }

    function loop() {
      x += (tx - x) * 0.15
      y += (ty - y) * 0.15
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={dotRef} className="cursor-dot" />
}


