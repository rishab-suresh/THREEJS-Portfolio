import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import LavaTitle from './LavaTitle'
import RainbowWalls from './RainbowWalls'
// import { Link } from 'react-router-dom'

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.from(titleRef.current, { yPercent: 100, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from(subRef.current, { y: 16, opacity: 0, duration: 0.6 }, '-=0.3')

      const stage = stageRef.current!
      const items = Array.from(stage.querySelectorAll<HTMLElement>('.parallax'))

      function onMove(e: MouseEvent) {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        gsap.to(stage, {
          rotationY: -nx * 6,
          rotationX: ny * 6,
          transformPerspective: 900,
          transformOrigin: 'center',
          duration: 0.6,
          ease: 'power3.out',
        })
        items.forEach((el) => {
          const depth = Number(el.dataset.depth || 24)
          gsap.to(el, {
            x: -nx * depth,
            y: -ny * depth,
            duration: 0.6,
            ease: 'power3.out',
          })
        })
      }

      function onLeave() {
        gsap.to(stage, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power3.out' })
        items.forEach((el) => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' }))
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseleave', onLeave)

      // Fade out rainbow field as hero leaves viewport
      const field = document.querySelector('.rainbow-field') as HTMLElement | null
      if (field) {
        gsap.to(field, {
          opacity: 0,
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'bottom 85%',
            end: 'bottom 55%',
            scrub: true,
          },
        })
      }

      return () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseleave', onLeave)
      }
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="section hero">
      <RainbowWalls />
      <div className="rainbow-fade" />
      <div ref={stageRef} className="container hero-stage" style={{ pointerEvents: 'auto' }}>
        <div className="hero-row">
          <div className="hero-col parallax" data-depth="40">
            <LavaTitle text="Rishab Suresh" />
            <div className="hero-cta-row">
              <p ref={subRef} className="hero-sub">
                Creative Engineer — Motion, Web, and delightful interactions
              </p>
              {/* CTA moved to Contact section */}
            </div>
            
          </div>
          {/* <div className="hero-col parallax" data-depth="40">
            <AvatarRainbow size={200} />
          </div> */}
        </div>
      </div>
    </section>
  )
}


