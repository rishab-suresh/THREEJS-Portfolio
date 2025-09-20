import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function Scatter({ count = 1500 }: { count?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Random points in a sphere for nice depth
      const r = Math.cbrt(Math.random()) * 3.6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      arr[i * 3 + 0] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    }
    return arr
  }, [count])

  useFrame(({ clock, size }) => {
    const t = clock.getElapsedTime()
    if (!materialRef.current) return
    materialRef.current.uniforms.u_time.value = t
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
  })

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
    }), []
  )

  const vertex = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    varying float v_depth;
    void main(){
      vec3 p = position;
      float t = u_time;
      // Slow sinusoidal drift to feel alive
      p.x += 0.08 * sin(t * 0.25 + p.y * 0.80) + 0.04 * cos(t * 0.18 + p.z * 1.10);
      p.y += 0.06 * cos(t * 0.22 + p.x * 0.90) + 0.03 * sin(t * 0.17 + p.z * 0.70);
      p.z += 0.05 * sin(t * 0.20 + p.y * 1.00);
      // Stretch horizontally by aspect so particles cover full width
      float aspect = max(1.0, u_resolution.x / u_resolution.y);
      p.x *= aspect;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      v_depth = -mv.z;
      gl_Position = projectionMatrix * mv;
      // Size attenuates with perspective; clamp for readability
      float size = 2.5 + 26.0 / (1.0 + v_depth);
      gl_PointSize = size;
    }
  `

  const fragment = `
    precision highp float;
    uniform vec2 u_resolution;
    varying float v_depth;
    void main(){
      // Soft round sprite
      vec2 uv = gl_PointCoord - 0.5;
      float r = length(uv);
      float alpha = smoothstep(0.5, 0.0, r);
      // Bright cyan with slight depth falloff
      vec3 c = vec3(0.0, 0.92, 1.0);
      float fade = clamp(1.0 - (v_depth / 14.0), 0.35, 1.0);
      gl_FragColor = vec4(c, alpha * fade);
    }
  `

  return (
    <points>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </points>
  )
}

export default function HeroParticles() {
  return (
    <div className="hero-particles" aria-hidden>
      <Canvas dpr={[1, 5]} camera={{ position: [0, 0, 5], fov: 60 }}>
        <Scatter count={500} />
      </Canvas>
    </div>
  )
}


