import { useEffect, useRef, useState } from 'react'
import type { Condition } from '../lib/content'
import { prefersReducedMotion } from '../lib/motion'
import StageSelector from './StageSelector'

interface Props {
  condition: Condition
  stage: number
  onStageChange: (position: number) => void
  open: boolean
  onClose: () => void
}

const STEP_MS = 600

export default function HeadPanel({ condition, stage, onStageChange, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [shown, setShown] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const current = condition.stages.find((s) => s.position === stage) ?? condition.stages[0]
  const witness = condition.testimonies[0]
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) {
      if (prefersReducedMotion()) return dialog.close()
      dialog.classList.add('is-closing')
      const t = window.setTimeout(() => { dialog.classList.remove('is-closing'); dialog.close() }, 300)
      return () => window.clearTimeout(t)
    }
  }, [open])

  // Les pensées apparaissent phrase par phrase ; elles repartent de zéro à chaque stade.
  useEffect(() => {
    if (!open) { setShown(0); return }
    setShown(prefersReducedMotion() ? current.thoughts.length : 0)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(i)
      if (i >= current.thoughts.length) window.clearInterval(id)
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [open, current])

  useEffect(() => {
    if (!canSpeak) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [open, current, canSpeak])

  const toggleVoice = () => {
    const synth = window.speechSynthesis
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    const u = new SpeechSynthesisUtterance(current.thoughts.join(' … '))
    u.lang = 'fr-FR'
    u.rate = 0.95
    u.onend = () => setSpeaking(false)
    synth.speak(u)
    setSpeaking(true)
  }

  return (
    <dialog
      ref={ref}
      className="head-panel"
      aria-labelledby="head-title"
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="head-inner">
        <div className="head-top">
          <span className="head-dot" aria-hidden="true" />
          <h2 id="head-title" style={{ fontSize: 17 }}>Dans sa tête</h2>
          <span className="mono muted" style={{ fontSize: 12 }}>
            {witness ? `${witness.witness_name}${witness.witness_age ? `, ${witness.witness_age} ans` : ''}` : condition.name}
          </span>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fermer le panneau">×</button>
        </div>

        {condition.stages.length > 1 && (
          <StageSelector stages={condition.stages} value={stage} onChange={onStageChange} compact />
        )}

        <ol className="thoughts" aria-live="polite">
          {current.thoughts.slice(0, shown).map((t, i) => (
            <li key={`${current.position}-${i}`} className="thought">« {t} »</li>
          ))}
        </ol>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {canSpeak && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={toggleVoice} aria-pressed={speaking}>
              {speaking ? '■ Arrêter la voix off' : '▶ Écouter en voix off'}
            </button>
          )}
          <p className="mono muted" style={{ fontSize: 12 }}>
            Exemple de ton, réécrit et enregistré avec les témoins avant publication. Voix de synthèse en attendant.
          </p>
        </div>
      </div>
    </dialog>
  )
}
