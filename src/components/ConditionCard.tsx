import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { glowFor, pad2, type Condition } from '../lib/content'

export function SceneVisual({ condition }: { condition: Condition }) {
  return (
    <div className="scene-visual" style={{ '--glow': glowFor(condition.slug) } as CSSProperties}>
      <span className="mono">scène : {condition.scene_title}</span>
      {condition.vision_kind
        ? <span className="tag tag-action">Vision 3D</span>
        : <span className="tag">Vision 3D · bientôt</span>}
    </div>
  )
}

export function prevalenceLabel(c: Condition) {
  return `${pad2(c.rank)} · ${c.prevalence}${c.prevalence_unverified ? ' *' : ''}`
}

export default function ConditionCard({ condition }: { condition: Condition }) {
  return (
    <Link
      to={`/handicap/${condition.slug}`}
      viewTransition
      className="card"
      style={{ viewTransitionName: `fiche-${condition.slug}` }}
    >
      <SceneVisual condition={condition} />
      <div className="card-body">
        <span className="card-meta">{prevalenceLabel(condition)}</span>
        <h3 className="card-title" style={{ viewTransitionName: `titre-${condition.slug}` }}>{condition.name}</h3>
        <span className="card-sub">{condition.stages_summary}</span>
      </div>
    </Link>
  )
}
