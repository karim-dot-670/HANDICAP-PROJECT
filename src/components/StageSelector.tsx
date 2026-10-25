import { useId } from 'react'
import type { Stage } from '../lib/content'

interface Props {
  stages: Stage[]
  value: number
  onChange: (position: number) => void
  scaleLabel?: string
  compact?: boolean
}

// Radios natives : les flèches du clavier changent de stade, et les lecteurs d'écran
// annoncent « Stade, Sévère, 3 sur 4 » sans ARIA supplémentaire.
export default function StageSelector({ stages, value, onChange, scaleLabel, compact }: Props) {
  const name = useId()
  return (
    <fieldset className="stage-selector">
      <legend className={compact ? 'visually-hidden' : undefined}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Stade</span>
        {scaleLabel && <span className="mono" style={{ fontSize: 13, color: 'var(--ambre)' }}>{scaleLabel}</span>}
      </legend>
      <div className="stage-options">
        {stages.map((s) => (
          <label key={s.position} className="stage-option">
            <input
              type="radio"
              name={name}
              value={s.position}
              checked={s.position === value}
              onChange={() => onChange(s.position)}
            />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
