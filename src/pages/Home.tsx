import { Link } from 'react-router'
import ConditionCard from '../components/ConditionCard'
import Status from '../components/Status'
import { useContent } from '../lib/content'
import { useReducedMotion } from '../lib/motion'
import { useTitle } from '../lib/useTitle'

const ways = [
  { title: 'Lire', text: 'Le témoignage, raconté par la personne elle-même.' },
  { title: 'Voir', text: 'Le monde à travers ses yeux, avec la Vision 3D.' },
  { title: 'Entendre', text: 'Ce qui se passe dans sa tête, stade par stade.' },
]

export default function Home() {
  useTitle('')
  const content = useContent()
  const count = content.status === 'ready' ? content.conditions.length : null
  const reducedMotion = useReducedMotion()

  return (
    <div className="container">
      <section className="hero hero-split" aria-labelledby="hero-title">
        <div className="hero-text">
          <span className="overtitle">Le handicap au quotidien, raconté par celles et ceux qui le vivent</span>
          <h1 id="hero-title" className="display">Il y a une marche.</h1>
          <p className="lead">
            Pour vous, 5 cm. Pour d’autres, une porte fermée. Ici, des personnes en situation de handicap racontent
            les obstacles que crée leur environnement. Lisez, voyez, entendez, puis découvrez ce que vous pouvez changer.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#catalogue">Découvrir les {count ?? ''} handicaps <span aria-hidden="true">↓</span></a>
            <Link className="btn btn-secondary" to="/idees-recues" viewTransition>Tester mes idées reçues</Link>
          </div>
        </div>
        {/* Muette par défaut (aucun son sans action) ; lecture auto sauf si « réduire les animations ». */}
        <figure className="hero-video" aria-labelledby="video-title">
          <h2 id="video-title" className="hero-video-title">La vision et les pensées d’un autre</h2>
          <video
            src="/video/autrement-vu-presentation.mp4"
            controls
            muted
            loop
            playsInline
            autoPlay={!reducedMotion}
            preload="metadata"
            aria-labelledby="video-title"
          />
          <figcaption className="mono muted">Activez le son avec le bouton du lecteur</figcaption>
        </figure>
      </section>

      <ul className="gestures" aria-label="Trois façons de comprendre" style={{ marginTop: 8 }}>
        {ways.map((w, n) => (
          <li key={w.title} className="panel" style={{ gap: 6 }}>
            <span className="overtitle">0{n + 1}</span>
            <span className="h3">{w.title}</span>
            <span className="muted">{w.text}</span>
          </li>
        ))}
      </ul>

      <section id="catalogue" className="section" aria-labelledby="catalogue-title" style={{ scrollMarginTop: 24 }}>
        <div className="section-head">
          <span className="overtitle">Les plus courants d’abord, puis les maladies rares</span>
          <h2 id="catalogue-title" className="h2">{count ?? ''} façons de vivre la même ville</h2>
          <p className="muted" style={{ maxWidth: '70ch' }}>
            Les chiffres sont des ordres de grandeur. Ceux marqués * sont des estimations courantes,
            non confirmées par une source officielle.
          </p>
        </div>
        <Status />
        {content.status === 'ready' && (
          <ul className="card-grid">
            {content.conditions.map((c) => (
              <li key={c.slug}><ConditionCard condition={c} /></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
