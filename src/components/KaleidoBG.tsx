import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function KaleidoMesh({ hue = 200 }: { hue?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const easedMouse = useRef(new THREE.Vector2(0, 0))
  const tmp = new THREE.Vector2()
  useFrame(({ clock, mouse, size }) => {
    const t = clock.getElapsedTime()
    // Ease mouse toward target for a smoother feel
    tmp.set(mouse.x, mouse.y)
    easedMouse.current.lerp(tmp, 0.08)
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = t
      matRef.current.uniforms.u_hue.value = hue / 360
      matRef.current.uniforms.u_mouse.value.copy(easedMouse.current)
      matRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    }
  })

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_hue: { value: hue / 360 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(1, 1) },
    }), [hue]
  )

  const fragment = `
    precision highp float;
    uniform float u_time;
    uniform float u_hue;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;

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

    vec3 hsl2rgb(vec3 c){
      vec3 p = abs(fract(c.xxx + vec3(0., 2./3., 1./3.)) * 6. - 3.);
      vec3 rgb = c.z + c.y * (clamp(p - 1., 0., 1.) - 0.5);
      return rgb;
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
      uv.x *= u_resolution.x / u_resolution.y;
      // Offset center by cursor (invert Y so it feels natural). Scale to keep subtle.
      vec2 centerShift = vec2(u_mouse.x, -u_mouse.y) * 0.35;
      uv -= centerShift;
      float r = length(uv);
      float a = atan(uv.y, uv.x);
      float seg = 6.0;
      a = mod(a, 6.28318 / seg);
      a = abs(a - (3.14159/seg));
      float n = noise(vec2(a*2.0, r*2.0 - u_time*0.2));
      float m = noise(vec2(a*4.0 + u_time*0.1, r*3.0));
      // Pink + White palette
      float huePink = 0.92; // ~330 degrees
      float sat = 0.55 + 0.15*n;
      float light = 0.72 + 0.18*sin(r*6.0 - u_time*0.6) + 0.06*m;
      vec3 pink = hsl2rgb(vec3(huePink, sat, light));
      // Blend toward white to keep readability
      float whiteMix = 0.78 + 0.10*n; // brighter white bias
      vec3 col = mix(vec3(1.0), pink, whiteMix);
      col = clamp(col, 0.0, 1.0);
      gl_FragColor = vec4(col, 0.82);
    }
  `

  const vertex = `
    precision highp float;
    void main(){ gl_Position = vec4(position, 1.0); }
  `

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={matRef} fragmentShader={fragment} vertexShader={vertex} transparent uniforms={uniforms} />
    </mesh>
  )
}

export default function KaleidoBG({ hue = 200 }: { hue?: number }) {
  return (
    <div className="work-bg">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1], fov: 50 }}>
        <KaleidoMesh hue={hue} />
      </Canvas>
    </div>
  )
}


