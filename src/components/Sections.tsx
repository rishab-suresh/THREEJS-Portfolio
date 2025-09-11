import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import About from './sections/About'
import KaleidoBG from '../components/KaleidoBG'
import Contact from './sections/Contact'
import Projects from './sections/Projects'

gsap.registerPlugin(ScrollTrigger)

export default function Sections() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.reveal')
      items.forEach((el) => {
        gsap.set(el, { y: 24, opacity: 0 })
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef}>
      <About />
      <Projects />
      <section className="section section-work">
        <KaleidoBG />
        <div className="container">
          <h2 className="reveal">Work</h2>
          <ul className="reveal">
            <li>Project A — kinetic landing</li>
            <li>Project B — data viz narrative</li>
            <li>Project C — micro-interactions</li>
          </ul>
        </div>
      </section>
      <Contact />
    </div>
  )
}


