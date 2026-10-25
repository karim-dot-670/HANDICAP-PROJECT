import { useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { prevalenceLabel, SceneVisual } from '../components/ConditionCard'
import HeadPanel from '../components/HeadPanel'
import StageSelector from '../components/StageSelector'
import Status from '../components/Status'
import TestimonyBlock from '../components/TestimonyBlock'
import VisionDialog from '../components/VisionDialog'
import { useContent } from '../lib/content'
import { prefersReducedMotion } from '../lib/motion'
import { track } from '../lib/track'
import { useTitle } from '../lib/useTitle'
import NotFound from './NotFound'

const kindLabels = { aider: 'Aider', eviter: 'À éviter', amenager: 'Aménager' }

export default function ConditionPage() {
  const { slug } = useParams()
  const content = useContent()
  const [params, setParams] = useSearchParams()
  const [headOpen, setHeadOpen] = useState(false)
  const [visionOpen, setVisionOpen] = useState(false)
  const [origin, setOrigin] = useState<DOMRect | null>(null)
  const [shareNote, setShareNote] = useState('')
  const actionsRef = useRef<HTMLElement>(null)

  const conditions = content.status === 'ready' ? content.conditions : []
  const index = conditions.findIndex((c) => c.slug === slug)
  const condition = conditions[index]
  useTitle(condition?.name ?? '')

  if (content.status !== 'ready') return <Status />
  if (!condition) return <NotFound />

  const requested = Number(params.get('stade'))
  const stage = condition.stages.some((s) => s.position === requested) ? requested : condition.stages[0].position
  const current = condition.stages.find((s) => s.position === stage)!
  const setStage = (position: number) =>
    setParams({ stade: String(position) }, { replace: true, preventScrollReset: true })

  const prev = conditions[index - 1]
  const next = conditions[index + 1]

  const goToActions = () => {
    track('action_click', condition.slug)
    setVisionOpen(false)
    window.setTimeout(() => {
      actionsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      actionsRef.current?.focus({ preventScroll: true })
    }, 50)
  }

  const share = async () => {
    track('share', condition.slug)
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${condition.name} · Autrement vu`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareNote('Lien copié.')
      }
    } catch {
      /* partage annulé par le visiteur */
    }
  }

  return (
    <div className="container">
      <Link to="/" viewTransition className="link-action back-link">← Les 13 handicaps</Link>

      <header className="fiche-hero" style={{ viewTransitionName: `fiche-${condition.slug}` }}>
        <SceneVisual condition={condition} />
        <div className="fiche-hero-body">
          <span className="card-meta">{prevalenceLabel(condition)} de personnes en France</span>
          <h1 className="h1" style={{ viewTransitionName: `titre-${condition.slug}` }}>{condition.name}</h1>
          <div className="tags fade-in">
            {condition.invisible && <span className="tag tag-ambre">Handicap souvent invisible</span>}
            {condition.prevalence_unverified && <span className="tag">Chiffre à vérifier *</span>}
            <span className="tag">{condition.stages_summary}</span>
          </div>
        </div>
      </header>

      <div className="fade-in">
        <p className="lead" style={{ marginTop: 40 }}>{condition.intro}</p>

        <div className="fiche-grid">
          <div className="panel">
            {condition.stages.length > 1 ? (
              <StageSelector stages={condition.stages} value={stage} onChange={setStage} scaleLabel={condition.scale_label} />
            ) : (
              <p className="overtitle">{condition.scale_label}</p>
            )}
            <p key={stage} className="crossfade" aria-live="polite" style={{ color: 'var(--texte-2)', fontSize: 17 }}>
              <strong style={{ color: 'var(--craie)' }}>{current.label}.</strong> {current.description}
            </p>
          </div>

          <div className="panel actions-panel">
            {condition.vision_kind ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  setOrigin(e.currentTarget.getBoundingClientRect())
                  setVisionOpen(true)
                  track('vision3d_open', condition.slug)
                }}
              >
                Vision 3D <span aria-hidden="true">→</span>
              </button>
            ) : (
              <p className="muted" style={{ fontSize: 16 }}>
                <span className="tag" style={{ marginRight: 8 }}>Vision 3D · bientôt</span>
                Scène prévue : {condition.scene_description}
              </p>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setHeadOpen(true); track('head_open', condition.slug) }}
            >
              Dans sa tête
            </button>
            <a className="link-action" href="#agir" onClick={(e) => { e.preventDefault(); goToActions() }}>
              Ce que je peux faire
            </a>
          </div>
        </div>

        {condition.testimonies.length > 0 && (
          <section className="section" aria-labelledby="temoignage-title">
            <div className="section-head">
              <span className="overtitle">Témoignage</span>
              <h2 id="temoignage-title" className="h2">Dans ses mots</h2>
            </div>
            {condition.testimonies.map((t) => (
              <TestimonyBlock key={t.id} testimony={t} conditionSlug={condition.slug} />
            ))}
          </section>
        )}
        {condition.testimonies.length === 0 && (
          <section className="section" aria-labelledby="temoignage-title">
            <div className="section-head">
              <span className="overtitle">Témoignage</span>
              <h2 id="temoignage-title" className="h2">Ce témoignage reste à écrire</h2>
            </div>
            <p className="muted">
              Vous vivez avec ce handicap ou cette maladie, ou vous accompagnez un proche ?{' '}
              <Link to="/contact?sujet=temoignage">Proposez votre témoignage</Link> : vous garderez la main sur votre récit.
            </p>
          </section>
        )}

        <section id="agir" ref={actionsRef} tabIndex={-1} className="section" aria-labelledby="agir-title" style={{ scrollMarginTop: 24 }}>
          <div className="section-head">
            <span className="overtitle">3 gestes concrets</span>
            <h2 id="agir-title" className="h2">Ce que je peux faire</h2>
          </div>
          <ul className="gestures">
            {condition.gestures.map((g) => (
              <li key={g.id} className="panel gesture">
                <span className="gesture-kind" data-kind={g.kind}>{kindLabels[g.kind]}</span>
                <span className="gesture-title">{g.title}</span>
                <span className="muted">{g.body}</span>
              </li>
            ))}
          </ul>
          <div className="btn-row" style={{ alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={share}>Partager cette page</button>
            <span role="status" className="muted">{shareNote}</span>
          </div>
        </section>

        <nav className="pager" aria-label="Fiches voisines">
          {prev ? <Link to={`/handicap/${prev.slug}`} viewTransition className="link-action">← {prev.name}</Link> : <span />}
          {next && <Link to={`/handicap/${next.slug}`} viewTransition className="link-action">{next.name} →</Link>}
        </nav>
      </div>

      <HeadPanel condition={condition} stage={stage} onStageChange={setStage} open={headOpen} onClose={() => setHeadOpen(false)} />
      {condition.vision_kind && (
        <VisionDialog
          condition={condition}
          stage={stage}
          onStageChange={setStage}
          open={visionOpen}
          origin={origin}
          onClose={() => setVisionOpen(false)}
          onSeeActions={goToActions}
        />
      )}
    </div>
  )
}
