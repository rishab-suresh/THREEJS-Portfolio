# Fashion Morph – Concept Notes

## Intent
Create a scroll-driven 3D experience where cloth-like ribbons wrap around a central silhouette (organism), then unfurl into flowing forms. Aesthetic direction: elegant, additive glow, fashion-forward color palette (warm copper / amber), smooth GSAP-driven transitions.

## Inspiration
- Seamless, high-end transitions akin to fashion micro-sites
- Cloth/ribbon motifs that reveal/hide form
- Organic orbiting particles complementing silhouette

## Core Interactions
- Scroll scrubs a master GSAP timeline
- Phases:
  1) Reveal: Ribbons fade in and wrap close to silhouette
  2) Morph: Ribbons shift, tighten/loosen; organism scale and shader intensity change
  3) Unfurl: Ribbons unwrap and flow outward; particles orbit softly

## Technical Approach (Modular)
- Single R3F Canvas (recommended for seamless transitions)
- Components:
  - `Organism` (icosahedron w/ displacement shader, exposes `uniforms`, transforms, tumble)
  - `SparkSwarm` (GPU-friendly particles orbiting a target)
  - `RibbonTrails` (instanced strips; shader controls spiral path, wrap factor, color, opacity)
- GSAP master timeline controls:
  - `Organism`: `scale`, `rotation`, `tumble.amplitude`, `uniforms.u_intensity`
  - `SparkSwarm`: `u_spread`, `u_opacity`, `u_size`, `u_orbitStrength`, `u_color`
  - `RibbonTrails`: `u_opacity`, `u_wrap`, `u_outerRadius`, `u_color`

## Shaders
- `Ribbon Vertex`:
  - Spiral around target with per-instance offset
  - Width offset for strip thickness
  - `u_wrap` blends positions toward target to “hug” silhouette
  - Subtle flutter for fabric feel
- `Ribbon Fragment`:
  - Additive color, soft edges, opacity via uniform

## Performance Notes
- Keep trail count modest (e.g., 16–32)
- Use instancing for ribbons; additive blending for glow; depthWrite off
- Keep particle counts in budget; prefer uniforms over per-frame CPU work

## Next Steps
- Confirm this notes file as the working doc
- Define color palette and lighting look
- Decide on standalone repo vs template fork
- Wire minimal GSAP segment for wrap → unfurl
- Add a sectioned HTML overlay or minimal headings

