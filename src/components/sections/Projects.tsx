import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'

type Repo = {
  id: string | number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  owner: { login: string }
}

const GH_USER = (import.meta.env.VITE_GH_USER as string) || 'rishab-suresh'
const GH_TOKEN = import.meta.env.VITE_GH_TOKEN as string | undefined

export default function Projects() {
  const [repos, setRepos] = useState<Repo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  const LANG_META = useMemo(() => ({
    javascript: { color: '#f7df1e', abbr: 'JS' },
    typescript: { color: '#3178c6', abbr: 'TS' },
    python: { color: '#3776ab', abbr: 'PY' },
    go: { color: '#00ADD8', abbr: 'GO' },
    rust: { color: '#dea584', abbr: 'RS' },
    ruby: { color: '#cc342d', abbr: 'RB' },
    java: { color: '#b07219', abbr: 'JV' },
    c: { color: '#555555', abbr: 'C' },
    'c++': { color: '#00599C', abbr: 'C++' },
    'c#': { color: '#178600', abbr: 'C#' },
    php: { color: '#777bb3', abbr: 'PHP' },
    shell: { color: '#89e051', abbr: 'SH' },
    html: { color: '#e34c26', abbr: 'HTML' },
    css: { color: '#563d7c', abbr: 'CSS' },
  } as Record<string, { color: string; abbr: string }>), [])

  useEffect(() => {
    let alive = true
    const controller = new AbortController()

    async function fetchPinned(): Promise<Repo[]> {
      // Prefer GraphQL if a token is provided (most reliable for pinned)
      if (GH_TOKEN) {
        const query = `
          query($login: String!) {
            user(login: $login) {
              pinnedItems(first: 8, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    id
                    name
                    description
                    url
                    stargazerCount
                    primaryLanguage { name }
                    owner { login }
                  }
                }
              }
            }
          }
        `
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `bearer ${GH_TOKEN}`,
          },
          body: JSON.stringify({ query, variables: { login: GH_USER } }),
        })
        if (!res.ok) throw new Error(`GraphQL ${res.status}`)
        const json = await res.json()
        const nodes = json?.data?.user?.pinnedItems?.nodes || []
        return nodes.map((n: any) => ({
          id: n.id,
          name: n.name,
          description: n.description,
          html_url: n.url,
          stargazers_count: n.stargazerCount,
          language: n.primaryLanguage?.name || null,
          owner: { login: n.owner?.login || GH_USER },
        }))
      }

      // Fallback: community pinned API (no auth)
      const r = await fetch(`https://gh-pinned-repos.egoist.dev/?username=${GH_USER}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
      const data = await r.json()
      const mapped: Repo[] = (data || []).map((d: any, idx: number) => ({
        id: d.repo || idx,
        name: d.repo,
        description: d.description || null,
        html_url: d.link,
        stargazers_count: Number(d.stars) || 0,
        language: d.language || null,
        owner: { login: GH_USER },
      }))
      return mapped
    }

    async function run() {
      try {
        const pinned = await fetchPinned()
        if (!alive) return
        if (pinned?.length) {
          setRepos(pinned)
          return
        }
        throw new Error('No pinned found')
      } catch (e) {
        // Final fallback: show top starred so the section isn’t empty
        try {
          const r = await fetch(`https://api.github.com/users/${GH_USER}/starred?per_page=8`, {
            signal: controller.signal,
            headers: { Accept: 'application/vnd.github+json' },
            cache: 'no-store',
          })
          if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
          const data = (await r.json()) as Repo[]
          if (!alive) return
          setRepos(data)
          setError('Showing starred as fallback')
        } catch (e2: any) {
          if (!alive) return
          setError('Failed to load pinned or starred')
        }
      }
    }

    run()

    return () => {
      alive = false
      controller.abort()
    }
  }, [])

  // Parallax tilt per card + haze shift
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.project-card'))
    if (!cards.length) return

    const cleanups: Array<() => void> = []
    cards.forEach((card) => {
      const haze = card.querySelector<HTMLElement>('.project-haze')
      function onMove(e: MouseEvent) {
        const rect = card.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5 // -0.5..0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        gsap.to(card, {
          rotationY: nx * 8,
          rotationX: -ny * 8,
          transformPerspective: 900,
          transformOrigin: 'center',
          duration: 0.4,
          ease: 'power3.out',
        })
        if (haze) {
          gsap.to(haze, { x: nx * 22, y: ny * 22, duration: 0.4, ease: 'power3.out' })
        }
      }
      function onLeave() {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' })
        if (haze) gsap.to(haze, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' })
      }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [repos])

  return (
    <section ref={rootRef} id="projects" className="section section-projects">
      <div className="container projects">
        <div className="projects-head">
          <h2>Projects</h2>
          <a className="muted" href={`https://github.com/${GH_USER}?tab=repositories`} target="_blank" rel="noreferrer">Others →</a>
        </div>

        {!repos && !error && (
          <div className="projects-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="project-card skeleton" key={i} />
            ))}
          </div>
        )}

        {error && (
          <p className="muted">{error}</p>
        )}

        {repos && (
          <div className="projects-grid">
            {repos.map((r) => (
              <a
                key={r.id}
                href={r.html_url}
                className="project-card"
                target="_blank"
                rel="noreferrer"
              >
                <div className="project-haze" aria-hidden />
                <div className="project-drip" />
                <div className="project-body">
                  {(() => {
                    const key = (r.language || '').toLowerCase()
                    const meta = LANG_META[key] || { color: '#ddd', abbr: (r.language || '?').slice(0, 2).toUpperCase() }
                    return (
                      <div
                        className="project-thumb"
                        aria-hidden
                        style={{ ['--thumb' as any]: meta.color } as any}
                      >
                        <span className="project-thumb-label">{meta.abbr}</span>
                      </div>
                    )
                  })()}
                  <div className="project-header">
                    <h3 className="project-title">{r.name}</h3>
                    {r.language && <span className="project-lang">{r.language}</span>}
                  </div>
                  {/* description removed by request */}
                  <div className="project-footer">
                    <span className="muted">by {r.owner?.login}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Card parallax tilt and haze shift
// Attach listeners once repos are rendered
// Note: kept inside the module for clarity but runs per component via effect below
export function useProjectsParallax(root: HTMLElement | null) {
  if (!root) return
}



