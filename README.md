### Three.js Portfolio — React, R3F, GSAP, Shaders

Motion-first portfolio with lightweight WebGL flourishes. Built with React + TypeScript + Vite, GSAP/ScrollTrigger for choreography, Lenis for smooth scrolling, and custom GLSL shaders rendered via @react-three/fiber.

- **Framework**: React 19 + TypeScript + Vite
- **Motion**: GSAP 3 + ScrollTrigger, custom parallax/tilt
- **Smooth scroll**: Lenis, integrated with GSAP ticker
- **WebGL**: three.js via @react-three/fiber, custom fragment shaders


## Quick start

Requirements: Node 18+

```bash
npm i
npm run dev

# build & preview
npm run build
npm run preview
```

Optional environment variables for the Projects section:

```bash
# .env
VITE_GH_USER=rishab-suresh
# If provided, GraphQL is used to fetch pinned repos (more reliable)
VITE_GH_TOKEN=ghp_your_token_here
```


## App structure

```
src/
  main.tsx            # Router and app boot
  App.tsx             # Smooth scroll init + page scaffold
  lib/smoothScroll.ts # Lenis + GSAP wiring
  components/
    BootOverlay.tsx   # Welcome + quote boot screen (GSAP timeline)
    Cursor.tsx        # Eased custom cursor dot
    Hero.tsx          # LavaTitle + RainbowWalls + pointer parallax
    LavaTitle.tsx     # SVG gooey masked text with animated blobs
    RainbowWalls.tsx  # GSAP-animated falling rainbow stripes
    KaleidoBG.tsx     # R3F shader background (kaleidoscopic noise)
    Sections.tsx      # ScrollTrigger reveals; mounts sections
    sections/
      About.tsx       # Typewriter text + canvas particles background
      Projects.tsx    # GitHub pinned/backup starred repos + tilt cards
      Contact.tsx     # R3F Julia shader grid + contact links
```


## Fundamentals, explained

### React + routing
The app uses a minimal router with one internal route (`/`) and a redirect route (`/portfolio`) that points to the deployed work portfolio.

```tsx
// main.tsx (excerpt)
const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/portfolio', element: <Navigate to="https://portfolio-kappa-gilt-97.vercel.app/" replace /> },
])
```

### Smooth scrolling with Lenis + GSAP
Lenis drives the scroll and GSAP’s ticker delivers its animation frames. On each Lenis scroll, ScrollTrigger is nudged to stay in sync.

```ts
// lib/smoothScroll.ts (annotated)
export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.1,     // feel of the scroll easing
    smoothWheel: true, // wheel smoothing
    wheelMultiplier: 1 // baseline sensitivity
  })

  // Keep ScrollTrigger timelines in sync with Lenis
  lenis.on('scroll', () => ScrollTrigger.update())

  // Use GSAP’s ticker so everything runs on one clock
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0) // prevent catch-up bursts
}
```

### Motion with GSAP/ScrollTrigger
- Entrance timelines for the hero text
- Hover/tilt parallax interactions
- Scroll-based reveals for sections

```tsx
// Hero.tsx (excerpt)
useLayoutEffect(() => {
  const tl = gsap.timeline()
  tl.from(titleRef.current, { yPercent: 100, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from(subRef.current, { y: 16, opacity: 0, duration: 0.6 }, '-=0.3')

  // Pointer parallax: tilt stage + offset children by depth
  function onMove(e: MouseEvent) {
    const nx = e.clientX / window.innerWidth - 0.5
    const ny = e.clientY / window.innerHeight - 0.5
    gsap.to(stageRef.current!, { rotationY: -nx * 6, rotationX: ny * 6, duration: 0.6 })
  }
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])
```

Section reveals are declarative and scoped with `gsap.context` for safe cleanup:

```tsx
// Sections.tsx (excerpt)
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
      gsap.set(el, { y: 24, opacity: 0 })
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      })
    })
  })
  return () => ctx.revert()
}, [])
```

### WebGL with @react-three/fiber (R3F)
R3F renders three.js scenes as React components. Shaders are small GLSL strings bound to a `shaderMaterial`. Uniforms are updated each frame using `useFrame`.

```tsx
// KaleidoBG.tsx (annotated)
function KaleidoMesh() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock, mouse, size }) => {
    if (!mat.current) return
    mat.current.uniforms.u_time.value = clock.getElapsedTime()
    mat.current.uniforms.u_mouse.value.set(mouse.x, mouse.y) // -1..1
    mat.current.uniforms.u_resolution.value.set(size.width, size.height)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} fragmentShader={fragment} vertexShader={vertex} transparent />
    </mesh>
  )
}
```

The Contact section uses a Julia set fragment shader rendered nine times at different offsets/phases for a rich layered look.


## Components tour

- **BootOverlay**: Minimal boot screen with a welcome fade and a quote, then fades away. Built with a single GSAP timeline and proper teardown.
- **Cursor**: A tiny DOM element that smoothly chases the real cursor using `requestAnimationFrame` and exponential smoothing.
- **Hero**: Composes `LavaTitle` (gooey masked SVG text) and `RainbowWalls` (animated vertical gradients). Adds pointer-driven parallax and fades out the rainbow field as you scroll.
- **LavaTitle**: SVG-only effect using an SVG filter (Gaussian blur + color matrix) to achieve the gooey/organic blending inside a text mask. Each circle “blob” has its own GSAP loop for wandering and breathing.
- **RainbowWalls**: Spawns colored stripes and runs three GSAP tweens per stripe (fall, sway, stretch). Mouse and wheel input temporarily time-scale the animations for a responsive feel.
- **Sections**: Sets up scroll reveals and renders `About`, `Projects`, and `Contact`.
- **About**: Typewriter bio, selectable “vibes” that change hue, and a lightweight canvas particle system with mouse influence and subtle connective lines.
- **Projects**: Fetches pinned repos via GitHub GraphQL when a token is present; otherwise falls back to a pinned-repos API, and finally to starred repos. Cards tilt on hover and apply a chromatic split shadow.
- **KaleidoBG**: A kaleidoscopic fragment shader behind the “Work” section, responding gently to the cursor.
- **Contact**: A grid of Julia shaders behind contact buttons.


## Notable snippets with inline commentary

Custom cursor chase loop:

```tsx
// Cursor.tsx
function loop() {
  x += (tx - x) * 0.15 // ease toward the target position
  y += (ty - y) * 0.15
  dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
  raf = requestAnimationFrame(loop)
}
```

Projects: GraphQL query branch (uses token if provided):

```ts
// Projects.tsx (excerpt)
const query = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 8, types: REPOSITORY) {
        nodes { ... on Repository { id name description url stargazerCount primaryLanguage { name } owner { login } } }
      }
    }
  }
`
```

Julia shader coloring: blend pinks with white for readability and a darker bias so UI stays legible on top:

```glsl
// Contact.tsx fragment (excerpt)
vec3 palette(float t){
  float huePink = 0.92;           // ~330 deg
  vec3 pink = hsl2rgb(vec3(huePink, 0.65, 0.55));
  return mix(vec3(1.0), pink, clamp(t, 0.0, 1.0));
}
```


## Performance & cleanup

- All GSAP setup is wrapped in `useEffect`/`useLayoutEffect` and cleaned up on unmount; `gsap.context` is used where convenient.
- Lenis is advanced by GSAP’s ticker to keep one coherent timeline; ScrollTrigger gets updated on each Lenis scroll.
- R3F scenes cap DPR in some canvases to keep fragment shaders affordable.
- Event listeners are attached with care and removed in effect cleanups.


## Extending the site

- Add a section: create a component under `components/sections`, import it in `Sections.tsx`, and add the `.reveal` class to elements you want staged-in.
- Add a shader background: follow `KaleidoBG.tsx` or `Contact.tsx`; expose uniforms you want to animate and update them in `useFrame`.
- Add a project source: extend the logic in `Projects.tsx` to add another fallback or filter.


## Scripts

- **dev**: local development server
- **build**: type-check and build
- **preview**: preview the production build locally


## Notes

- The `/portfolio` route is a convenience redirect to the dedicated work portfolio.
- No license is included; add your preferred license if publishing.

\n+## Commented code walkthrough

### Routing and app boot

```tsx
// src/main.tsx
const router = createBrowserRouter([
  { path: '/', element: <App /> },
  // Redirects to the external work portfolio; `replace` avoids adding a history entry
  { path: '/portfolio', element: <Navigate to="https://portfolio-kappa-gilt-97.vercel.app/" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Centralized router provider */}
    <RouterProvider router={router} />
  </StrictMode>,
)
```

```tsx
// src/App.tsx
useEffect(() => {
  // Initialize Lenis + GSAP ticker and ScrollTrigger sync once
  initSmoothScroll()
}, [])

return (
  <div>
    <BootOverlay />  {/* welcome + quote, fades away */}
    <Cursor />       {/* eased custom cursor */}
    <Hero />         {/* lava title + rainbow walls + parallax */}
    <Sections />     {/* About, Projects, Work BG, Contact with reveals */}
  </div>
)
```

### Smooth scroll + ScrollTrigger wiring

```ts
// src/lib/smoothScroll.ts
export function initSmoothScroll() {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 })

  // Nudge ScrollTrigger on each Lenis scroll so pinning/triggers stay accurate
  lenis.on('scroll', () => ScrollTrigger.update())

  // Advance Lenis using GSAP’s ticker for a single, consistent clock
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0) // avoid catch-up spikes
}
```

### Hero: entrance + pointer parallax + rainbow fade

```tsx
// src/components/Hero.tsx
useLayoutEffect(() => {
  const tl = gsap.timeline()
  // Stagger the title then subtitle in
  tl.from(titleRef.current, { yPercent: 100, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from(subRef.current, { y: 16, opacity: 0, duration: 0.6 }, '-=0.3')

  // Pointer parallax: tilt the stage and offset children by data-depth
  function onMove(e: MouseEvent) {
    const nx = e.clientX / innerWidth - 0.5
    const ny = e.clientY / innerHeight - 0.5
    gsap.to(stageRef.current!, { rotationY: -nx * 6, rotationX: ny * 6, duration: 0.6 })
  }
  window.addEventListener('mousemove', onMove)

  // Fade out the rainbow field as we scroll past the hero
  const field = document.querySelector('.rainbow-field') as HTMLElement | null
  if (field) {
    gsap.to(field, { opacity: 0, scrollTrigger: { trigger: rootRef.current, start: 'bottom 85%', end: 'bottom 55%', scrub: true } })
  }

  return () => {
    window.removeEventListener('mousemove', onMove)
  }
}, [])
```

### LavaTitle: gooey SVG mask with animated blobs

```tsx
// src/components/LavaTitle.tsx (highlights)
// SVG filter that blurs then boosts alpha to merge circles into “goo”
<filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
  <feBlend in="SourceGraphic" in2="goo" />
  {/* ↑ boosts overlapping alpha to form organic shapes */}
</filter>

// Mask text to show blobs only where glyphs are
<mask id="text-mask">
  <rect x="0" y="0" width="1200" height="300" fill="black" />
  <text x="50%" y="55%" textAnchor="middle" className="lava-text-mask">{text}</text>
</mask>

useEffect(() => {
  // Each circle wanders and “breathes” via GSAP attr tweens
  blobs.forEach((b, i) => {
    gsap.to(b, { attr: { cx: ox + dx, cy: oy + dy }, duration: 8 + (i % 5), repeat: -1, yoyo: true })
    gsap.to(b, { attr: { r: r * (i % 2 ? 1.12 : 0.88) }, duration: 6 + (i % 3), repeat: -1, yoyo: true })
  })
})
```

### RainbowWalls: falling stripes with responsive timeScale

```tsx
// src/components/RainbowWalls.tsx (highlights)
// Spawn colored drops with constrained horizontal bins to avoid edges
const drops = useDrops(70)

useEffect(() => {
  // For each drop: fall, sway horizontally, and stretch vertically
  anims.push(gsap.fromTo(el, { y: '-40vh' }, { y: '140vh', duration: yDur, ease: 'none', repeat: -1, delay }))
  anims.push(gsap.to(el, { x: xDir * sway, yoyo: true, repeat: -1, duration: 1.8 + Math.random() }))
  anims.push(gsap.to(el, { scaleY: 1.3, yoyo: true, repeat: -1, duration: 1.1 + Math.random() }))

  // Mouse & wheel temporarily speed up all tweens
  animsRef.current.forEach((t) => t.timeScale(factor))
})
```

### Sections: simple, scoped scroll reveals

```tsx
// src/components/Sections.tsx
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
      gsap.set(el, { y: 24, opacity: 0 })
      gsap.to(el, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } })
    })
  }, rootRef)
  return () => ctx.revert()
}, [])
```

### About: typewriter + canvas particles

```tsx
// src/components/sections/About.tsx (Typewriter)
useEffect(() => {
  // Per-frame, append a character based on desired speed
  const perChar = Math.max(8, speed)
  const tick = (t: number) => {
    if (t - last >= perChar) { setI((v) => Math.min(text.length, v + 1)); last = t }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}, [text, speed])
```

```ts
// src/components/sections/About.tsx (Particles highlights)
function step() {
  // Integrate velocity with slight damping and mouse repulsion
  p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.002
  // Wrap around edges and draw circles; connect a few floaters with faint lines
}
```

### Projects: pinned → fallback starred + card tilt

```ts
// src/components/sections/Projects.tsx (fetch branch)
if (GH_TOKEN) {
  // Prefer GraphQL pinned repos for reliability
  const res = await fetch('https://api.github.com/graphql', { headers: { Authorization: `bearer ${GH_TOKEN}` } })
} else {
  // Community pinned API; then fallback to starred if both fail
  await fetch(`https://gh-pinned-repos.egoist.dev/?username=${GH_USER}`)
}
```

```tsx
// Parallax tilt and chromatic split shadow per card
function onMove(e: MouseEvent) {
  const nx = (e.clientX - rect.left) / rect.width - 0.5
  const ny = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(card, { rotationY: nx * 8, rotationX: -ny * 8, transformPerspective: 900, duration: 0.4 })
  titleEl.style.textShadow = `${-split}px 0 0 rgba(255,0,0,0.55), ${split}px 0 0 rgba(0,180,255,0.55)`
}
```

### KaleidoBG: R3F shader with eased mouse

```tsx
// src/components/KaleidoBG.tsx (highlights)
useFrame(({ clock, mouse, size }) => {
  // Ease the mouse for smoother visual response
  easedMouse.current.lerp(new THREE.Vector2(mouse.x, mouse.y), 0.08)
  matRef.current!.uniforms.u_time.value = clock.getElapsedTime()
  matRef.current!.uniforms.u_mouse.value.copy(easedMouse.current)
  matRef.current!.uniforms.u_resolution.value.set(size.width, size.height)
})
```

### Contact: Julia shader grid

```tsx
// src/components/sections/Contact.tsx (JuliaBG)
// Render nine planes with shared shader but different phase/offset/opacity
windows.map((W) => (
  <mesh position={W.pos} scale={[W.scale, W.scale, 1]}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial uniforms={{ u_phase: { value: W.phase }, u_opacity: { value: W.opacity }, /* ... */ }} />
  </mesh>
))
```

### BootOverlay: timed welcome + quote

```tsx
// src/components/BootOverlay.tsx
const tl = gsap.timeline({ defaults: { ease: 'none' } })
tl.to(headerRef.current, { opacity: 1, duration: 0.6 }, 0) // show “Welcome” immediately
// Inject quote lines and stagger them in after 5s
lines.forEach((t, i) => tl.to(el, { opacity: 1 }, 5 + i * 0.08))
// Fade the overlay itself out shortly after, then unmount
tl.to(overlayRef.current, { opacity: 0, duration: 0.6 }, 5 + 2.5).add(() => setDone(true))
```

### Cursor: eased DOM follower

```tsx
// src/components/Cursor.tsx
function loop() {
  // Exponential smoothing toward the target cursor position
  x += (tx - x) * 0.15
  y += (ty - y) * 0.15
  dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
  raf = requestAnimationFrame(loop)
}
```

