import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function initSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 1,
  })

  lenis.on('scroll', () => {
    ScrollTrigger.update()
  })

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}


