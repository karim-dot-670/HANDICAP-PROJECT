import { Link } from 'react-router'
import { useTitle } from '../lib/useTitle'

export default function NotFound() {
  useTitle('Page introuvable')
  return (
    <div className="container" style={{ padding: '96px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <span className="overtitle">Erreur 404</span>
      <h1 className="h1">Cette page n’existe pas.</h1>
      <p className="lead">Elle a peut-être été déplacée, ou retirée à la demande d’un témoin.</p>
      <Link to="/" className="link-action">← Retour aux 13 handicaps</Link>
    </div>
  )
}
