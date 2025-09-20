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
        <KaleidoBG hue={210} />
        <div className="container">
          <h2 className="reveal">About Me</h2>
          <div className="reveal work-bio">
            <p>
              Piano enthusiast, football player, and an avid Pokémon fan (Gen 4 and below). I love finding
              balance between technical precision and creative expression.
            </p>

            <h3>🎮 Tech Exploration</h3>
            <p>
              Currently diving into Three.js, creating immersive 3D web experiences that push the boundaries of
              modern web development. I&apos;ve done backend development in the past and I&apos;m actively expanding my
              skills and knowledge across the stack.
            </p>

            <h3>🌍 Global Perspective</h3>
            <p>
              Proficient in German and learning French (A1 on Duolingo—though I speak it a bit better in my opinion).
              Growing up abroad shaped my ability to connect with and adapt to different cultures and environments.
            </p>

            <h3>🤝 Collaboration</h3>
            <p>
              My diverse background makes me culturally aware and open to new ideas, which helps me be a strong
              team player who values clarity, listening, and momentum.
            </p>

            <p>
              I&apos;ve traveled around 25 countries, learning different perspectives and cultures. Branching out into
              different fields and areas of expertise has made me very open to trying new things.
            </p>
          </div>
         
        </div>
      </section>
      <Contact />
    </div>
  )
}


