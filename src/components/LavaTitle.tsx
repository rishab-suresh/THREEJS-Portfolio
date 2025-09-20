import { useEffect, useRef } from 'react'
import gsap from 'gsap'

type Props = {
  text: string
}

export default function LavaTitle({ text }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const svg = svgRef.current!
    const group = groupRef.current!
    const blobs = Array.from(svg.querySelectorAll<SVGCircleElement>('.blob'))

    // Per-blob wandering + radius breathing
    const timelines: gsap.core.Tween[] = []
    blobs.forEach((b, i) => {
      const ox = parseFloat(b.getAttribute('cx') || '0')
      const oy = parseFloat(b.getAttribute('cy') || '0')
      const dx = (i % 2 === 0 ? 1 : -1) * (28 + (i * 9) % 36)
      const dy = (i % 3 === 0 ? -1 : 1) * (24 + (i * 7) % 32)
      const r = parseFloat(b.getAttribute('r') || '40')
      timelines.push(gsap.to(b, { attr: { cx: ox + dx, cy: oy + dy }, duration: 12 + (i % 5), repeat: -1, yoyo: true, ease: 'sine.inOut' }))
      timelines.push(gsap.to(b, { attr: { r: r * (i % 2 ? 1.12 : 0.88) }, duration: 10 + (i % 3), repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    })

    // Slow vertical drift for the whole blob group (original behavior)
    const drift = gsap.to(group, { y: -14, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    // Subtle horizontal bob so it feels lava-like but not sweeping across letters
    const driftX = gsap.to(group, { x: 20, duration: 16, repeat: -1, yoyo: true, ease: 'sine.inOut' })

    return () => {
      timelines.forEach((t) => t.kill())
      drift.kill()
      driftX.kill()
    }
  }, [])

  return (
    <svg ref={svgRef} className="lava-svg" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        {/* Goo filter */}
        <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>

        {/* Text mask */}
        <mask id="text-mask" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1200" height="300" fill="black" />
          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="lava-text-mask">
            {text}
          </text>
        </mask>
      </defs>

      {/* Reapply mask so the lava only shows inside the text */}
      <g ref={groupRef} filter="url(#goo)" mask="url(#text-mask)">
        <rect x="0" y="0" width="1200" height="300" fill="transparent" />
        {/* Blobs inside the text */}
        <circle className="blob" cx="520" cy="140" r="80" fill="rgba(255,255,255,0.9)" />
        <circle className="blob" cx="660" cy="160" r="75" fill="rgba(255,255,255,0.8)" />
        <circle className="blob" cx="580" cy="180" r="65" fill="rgba(240,240,240,0.85)" />
        <circle className="blob" cx="740" cy="120" r="60" fill="rgba(255,255,255,0.75)" />
        <circle className="blob" cx="460" cy="170" r="58" fill="rgba(220,220,220,0.85)" />
        {/* add a darker blob for contrast */}
        <circle className="blob" cx="600" cy="140" r="40" fill="rgba(0,0,0,0.35)" />
      </g>

      {/* Translucent text overlay for readability */}
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="lava-text-overlay">
        {text}
      </text>
    </svg>
  )
}


