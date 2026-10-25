import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react'
import type { Condition } from '../lib/content'
import StageSelector from './StageSelector'

// Three.js n'est chargé qu'au lancement d'une scène (pages légères en 4G).
const VisionScene = lazy(() => import('../vision/VisionScene'))

interface Props {
  condition: Condition
  stage: number
  onStageChange: (position: number) => void
  open: boolean
  origin: DOMRect | null
  onClose: () => void
  onSeeActions: () => void
}

type Phase = 'warning' | 'scene' | 'end'

export default function VisionDialog({ condition, stage, onStageChange, open, origin, onClose, onSeeActions }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [phase, setPhase] = useState<Phase>('warning')
  const [showDescription, setShowDescription] = useState(false)
  const current = condition.stages.find((s) => s.position === stage) ?? condition.stages[0]

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setPhase('warning')
      setShowDescription(false)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Échap ferme la scène (et mène au message de fin), puis la fenêtre.
  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault()
    if (phase === 'scene') setPhase('end')
    else onClose()
  }

  // Le zoom part du bouton, ramené dans l'écran s'il en est sorti (déclenchement au clavier, petit écran).
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max)
  const originStyle = origin
    ? ({
        '--ox': `${clamp(origin.left + origin.width / 2, window.innerWidth)}px`,
        '--oy': `${clamp(origin.top + origin.height / 2, window.innerHeight)}px`,
      } as CSSProperties)
    : undefined

  return (
    <dialog ref={ref} className="vision-dialog" style={originStyle} aria-labelledby="vision-title" onCancel={onCancel}>
      {open && phase === 'warning' && (
        <div className="vision-center">
          <div className="warning-card">
            <span className="overtitle">Avant de commencer</span>
            <h2 id="vision-title" className="h3">Vision 3D · {condition.name}</h2>
            <p style={{ fontSize: 18, lineHeight: 1.5 }}>{condition.vision_warning}</p>
            <p className="muted" style={{ fontSize: 16 }}>
              Stade choisi : <strong style={{ color: 'var(--craie)' }}>{current.label}</strong>. Vous pourrez le changer pendant la scène.
              Déplacez-vous à la souris, au doigt ou au clavier (flèches).
            </p>
            {showDescription && (
              <p className="crossfade" style={{ color: 'var(--texte-2)' }}>{condition.scene_description}</p>
            )}
            <div className="btn-row">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setPhase('scene')} autoFocus>
                Lancer la scène
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDescription((v) => !v)} aria-expanded={showDescription}>
                {showDescription ? 'Masquer la description' : 'Lire la description'}
              </button>
              <button type="button" className="link-action" onClick={onClose}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {open && phase === 'scene' && (
        <>
          <h2 id="vision-title" className="visually-hidden">Vision 3D · {condition.name} · {current.label}</h2>
          <Suspense fallback={<div className="vision-center"><p className="muted" role="status">Chargement de la scène…</p></div>}>
            <VisionScene condition={condition} intensity={current.intensity} />
          </Suspense>
          <div className="vision-bar">
            {condition.stages.length > 1 && (
              <StageSelector stages={condition.stages} value={stage} onChange={onStageChange} compact />
            )}
            <button type="button" className="btn btn-quiet quit" onClick={() => setPhase('end')}>
              Quitter <span className="kbd" aria-hidden="true">Échap</span>
            </button>
          </div>
        </>
      )}

      {open && phase === 'end' && (
        <div className="vision-center">
          <div className="end-card">
            <h2 id="vision-title" className="h1">Une minute ici ne remplace pas une vie.</h2>
            <p className="lead">Voici ce que vous pouvez faire.</p>
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={onSeeActions} autoFocus>Ce que je peux faire <span aria-hidden="true">→</span></button>
              <button type="button" className="btn btn-secondary" onClick={() => setPhase('scene')}>Revoir la scène</button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
