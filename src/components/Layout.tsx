import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { track } from '../lib/track'

const nav = [
  { to: '/', label: 'Les 13 handicaps', end: true },
  { to: '/idees-recues', label: 'Idées reçues' },
  { to: '/contact', label: 'Contact' },
  { to: '/a-propos', label: 'À propos' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    track('page_view', pathname.startsWith('/handicap/') ? pathname.split('/')[2] : undefined)
    // Après une navigation, on place le focus au début du contenu pour les lecteurs d'écran.
    if (firstRender.current) firstRender.current = false
    else mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="page-bg">
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand" viewTransition>
            <span className="brand-dot" aria-hidden="true" />
            Autrement vu
          </Link>
          <nav className="main-nav" aria-label="Navigation principale">
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} viewTransition>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenu" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            Autrement vu fait vivre les obstacles du quotidien, racontés par les personnes qui les rencontrent.
            Aucun conseil médical, aucun diagnostic.
          </p>
          <ul>
            <li><Link to="/a-propos">Éthique et sources</Link></li>
            <li><Link to="/contact">Proposer un témoignage</Link></li>
            <li><span>Sans cookie ni traceur publicitaire</span></li>
          </ul>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
