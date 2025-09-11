// import { useEffect, useRef } from 'react'
// import gsap from 'gsap'

// type Props = {
//   size?: number
// }

// export default function AvatarRainbow({ size = 200 }: Props) {
//   const svgRef = useRef<SVGSVGElement>(null)
//   const groupRef = useRef<SVGGElement>(null)

//   useEffect(() => {
//     const g = groupRef.current!
//     const tl = gsap.timeline({ repeat: -1, yoyo: true })
//     tl.to(g, { y: 10, duration: 3.5, ease: 'sine.inOut' })
//       .to(g, { x: 2, duration: 2.2, ease: 'sine.inOut' }, 0)
//     return () => tl.kill()
//   }, [])

//   const s = size

//   return (
//     <div className="avatar" style={{ width: s, height: s }}>
//       {/* Placeholder face */}
//       <div className="avatar-ph" />

//       {/* Rainbow tears overlay */}
//       <svg ref={svgRef} className="avatar-svg" viewBox={`0 0 ${s} ${s}`} width={s} height={s} aria-hidden>
//         <defs>
//           <clipPath id="avatar-clip">
//             <circle cx={s / 2} cy={s / 2} r={s / 2} />
//           </clipPath>
//         </defs>
//         <g ref={groupRef} clipPath="url(#avatar-clip)" opacity="0.9">
//           {/* Left eye tear bundle */}
//           {rainbowPaths({ x: s * 0.37, y: s * 0.42, height: s, wave: 18 })}
//           {/* Right eye tear bundle */}
//           {rainbowPaths({ x: s * 0.63, y: s * 0.42, height: s, wave: 18, flip: true })}
//         </g>
//       </svg>
//     </div>
//   )
// }

// function rainbowPaths({ x, y, height, wave, flip = false }: { x: number; y: number; height: number; wave: number; flip?: boolean }) {
//   const colors = ['#ff004c', '#ff7a00', '#ffd400', '#35d07f', '#1da1f2', '#6f42c1', '#b517ff']
//   const offset = 3.2
//   return colors.map((c, i) => {
//     const xi = x + (i - 3) * offset * (flip ? -1 : 1)
//     const y1 = y
//     const y2 = y + height * 0.55
//     const cp1x = xi + (flip ? -wave : wave)
//     const cp2x = xi - (flip ? -wave : wave)
//     const d = `M ${xi} ${y1} C ${cp1x} ${y1 + height * 0.18}, ${cp2x} ${y1 + height * 0.34}, ${xi} ${y2}`
//     return <path key={c + i} d={d} stroke={c} strokeWidth={2.2} strokeLinecap="round" fill="none" />
//   })
// }


