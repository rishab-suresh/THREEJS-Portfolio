import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Contact() {
  const LI = 'https://www.linkedin.com/in/rishab-suresh-a3a632191/'
  const GH = 'https://github.com/rishab-suresh'
  const EM = 'mailto:sureshrishab6@gmail.com'
  return (
    <section id="contact" className="section section-contact">
      <div className="contact-bg" aria-hidden>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 1], fov: 50 }}>
          <JuliaBG />
        </Canvas>
      </div>
      <div className="container">
        <h2 className="reveal">Contact</h2>
        <div className="contact-actions reveal">
          <a className="contact-btn" data-text="Portfolio (The work one)" href="https://portfolio-kappa-gilt-97.vercel.app/" target="_blank" rel="noreferrer">Portfolio (The work one) </a>
          <a className="contact-btn" data-text="LinkedIn" href={LI} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="contact-btn" data-text="GitHub" href={GH} target="_blank" rel="noreferrer">GitHub</a>
          <a className="contact-btn" data-text="Email" href={EM}>Email</a>
        </div>
      </div>
    </section>
  )
}

function JuliaBG() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock, size }) => {
    const t = clock.getElapsedTime()
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = t
      // Keep mouse neutral; autonomous motion instead
      matRef.current.uniforms.u_mouse.value.set(0, 0)
      matRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    }
  })

  const baseUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_phase: { value: 0 },
      u_scale: { value: 1 },
      u_opacity: { value: 0.95 },
      u_driftAmp: { value: 0.35 },
      u_warpAmp: { value: 0.12 },
      u_offset: { value: new THREE.Vector2(0, 0) },
    }), []
  )

  const fragment = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_mouse; // -1..1
    uniform vec2 u_resolution;
    uniform float u_phase;
    uniform float u_scale;
    uniform float u_opacity;
    uniform float u_driftAmp;
    uniform float u_warpAmp;
    uniform vec2 u_offset;

    // Map to [-1,1] screen
    vec2 toUV(vec2 p){
      vec2 uv = (p / u_resolution) * 2.0 - 1.0;
      uv.x *= u_resolution.x / u_resolution.y;
      return uv;
    }

    // Simple hash noise
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p){
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
    }

    // Color palette (pink/white), darker bias
    vec3 hsl2rgb(vec3 c){
      vec3 p = abs(fract(c.xxx + vec3(0., 2./3., 1./3.)) * 6. - 3.);
      vec3 rgb = c.z + c.y * (clamp(p - 1., 0., 1.) - 0.5);
      return rgb;
    }
    vec3 palette(float t){
      float huePink = 0.92; // ~330 deg
      vec3 pink = hsl2rgb(vec3(huePink, 0.65, 0.55));
      return mix(vec3(1.0), pink, clamp(t, 0.0, 1.0));
    }

    void main(){
      vec2 uv = toUV(gl_FragCoord.xy) * u_scale;

      // Autonomous drift of center
      float tt = u_time + u_phase;
      // Faster autonomous drift
      vec2 centerShift = u_driftAmp * vec2(sin(tt*0.28), cos(tt*0.22));
      uv -= centerShift;
      uv -= u_offset; // per-layer offset

      // Subtle UV warp (melty trails)
      vec2 warp = vec2(
        noise(uv*1.35 + tt*0.18) - 0.5,
        noise(uv*1.55 - tt*0.16) - 0.5
      );
      uv += warp * u_warpAmp;

      // Subtle kaleidoscope: mirror X into segments
      float seg = 6.0;
      float a = atan(uv.y, uv.x);
      float r = length(uv);
      a = mod(a, 6.28318/seg);
      a = abs(a - (3.14159/seg));
      uv = vec2(cos(a), sin(a)) * r;

      // Julia parameters
      vec2 z = uv * 1.6; // scale
      // c parameter with a bit more motion
      vec2 c = vec2(0.285, 0.01) + 0.15*vec2(sin(tt*0.3), cos(tt*0.26));

      float iter = 0.0;
      float maxIter = 60.0;
      float escape = 4.0;
      for (float i=0.0; i<60.0; i+=1.0){
        if (dot(z,z) > escape) { iter = i; break; }
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
      }
      // Smooth escape
      float sm = iter - log2(log2(dot(z,z))) + 2.0;
      float t = clamp(sm / maxIter, 0.0, 1.0);

      // Map to pink/white with subtle band smoothing (darker bias)
      vec3 col = palette(pow(t, 0.65));
      // Add gentle radial lightening for readability
      col = mix(vec3(1.0), col, 0.35 + 0.18*exp(-r*1.5));
      col *= 0.9;
      gl_FragColor = vec4(col, u_opacity);
    }
  `

  const vertex = `
    precision highp float;
    void main(){ gl_Position = vec4(position, 1.0); }
  `

  // Nine separate windows (3x3) of Julia sets for richer coverage
  const windows: { pos: THREE.Vector3; scale: number; phase: number; opacity: number; drift: number; warp: number; offset: THREE.Vector2 }[] = []
  const rows = [-0.5, 0.0, 0.5]
  const cols = [-0.75, 0.0, 0.75]
  let idx = 0
  for (let yi = 0; yi < rows.length; yi++) {
    for (let xi = 0; xi < cols.length; xi++) {
      const x = cols[xi]
      const y = rows[yi]
      const phase = 2.1 * idx
      const centerBoost = x === 0 && y === 0 ? 1.6 : 1.15
      windows.push({
        pos: new THREE.Vector3(x * 0.7, y * 0.6, 0),
        scale: centerBoost,
        phase,
        opacity: x === 0 && y === 0 ? 0.7 : 0.6,
        drift: 0.28 - Math.random() * 0.06,
        warp: 0.06 - Math.random() * 0.02,
        offset: new THREE.Vector2((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12),
      })
      idx++
    }
  }

  return (
    <group>
      {windows.map((W, i) => (
        <mesh key={i} position={W.pos} scale={[W.scale, W.scale, 1]}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={i === 0 ? matRef : undefined}
            fragmentShader={fragment}
            vertexShader={vertex}
            transparent
            depthWrite={false}
            uniforms={{
              u_time: baseUniforms.u_time,
              u_mouse: baseUniforms.u_mouse,
              u_resolution: baseUniforms.u_resolution,
              u_phase: { value: W.phase },
              u_scale: { value: 1.0 },
              u_opacity: { value: W.opacity },
              u_driftAmp: { value: W.drift },
              u_warpAmp: { value: W.warp },
              u_offset: { value: W.offset.clone() },
            }}
          />
        </mesh>
      ))}
    </group>
  )
}


