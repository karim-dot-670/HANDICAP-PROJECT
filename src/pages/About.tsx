import { Link } from 'react-router'
import { useTitle } from '../lib/useTitle'

export default function About() {
  useTitle('À propos')
  return (
    <div className="container" style={{ paddingTop: 64 }}>
      <div className="section-head">
        <span className="overtitle">À propos</span>
        <h1 className="h1">On écrit l’obstacle, pas la pitié.</h1>
      </div>

      <div className="prose" style={{ marginTop: 32 }}>
        <p className="lead">
          Ce site est né de proches en situation de handicap qui ont accepté de partager leur quotidien.
          Il montre les obstacles créés par l’environnement (un trottoir, un formulaire, un regard), pour que
          chacun reparte en sachant quoi changer.
        </p>

        <h2 className="h3">Rien sans les témoins</h2>
        <ul>
          <li>Chaque témoin donne son accord écrit pour son image, sa voix et son histoire.</li>
          <li>Il peut relire, corriger ou retirer son récit à tout moment.</li>
          <li>Il choisit son prénom ou un pseudonyme, une photo ou une illustration.</li>
          <li>Les stades et les simulations sont relus par un professionnel de santé ou une association.</li>
        </ul>

        <h2 className="h3">Les simulations ne sont pas la réalité</h2>
        <p>
          Une Vision 3D donne une idée, jamais l’expérience complète. Chaque scène est précédée d’un avertissement,
          ne contient aucun flash et peut être quittée à tout moment avec la touche Échap.
          Aucune crise d’épilepsie n’est simulée.
        </p>

        <h2 className="h3">Ce que ce site n’est pas</h2>
        <p>Ni conseil médical, ni diagnostic en ligne, ni collecte de dons.</p>

        <h2 className="h3">Vie privée</h2>
        <p>
          Aucun cookie, aucun traceur publicitaire, hébergement en Europe. Pour savoir si le site remplit son rôle,
          nous comptons quelques actions (témoignage lu jusqu’au bout, Vision 3D ouverte…) de façon anonyme :
          aucune adresse IP, aucun identifiant conservé d’une visite à l’autre.
        </p>

        <h2 className="h3">Accessibilité</h2>
        <p>
          Objectif : conformité WCAG 2.2 niveau AA (RGAA 4.1) sur toutes les pages, navigation complète au clavier,
          compatibilité avec les lecteurs d’écran. Un audit est prévu avant le lancement. Un obstacle sur ce site ?{' '}
          <Link to="/contact">Dites-le-nous</Link>.
        </p>

        <h2 className="h3">Sources des chiffres</h2>
        <p>Ordres de grandeur, vérifiés sur sources officielles avant la mise en ligne.</p>
        <ul>
          <li>Petit mémento sur le handicap, Département de la Manche : surdité, handicap moteur, déficience intellectuelle.</li>
          <li>Informer les personnes aveugles et malvoyantes, CNSA, 2024 : déficience visuelle.</li>
          <li>Autisme, Santé publique France : personnes autistes suivies (2017).</li>
          <li>Maladies neurologiques, hopital.fr : Alzheimer, épilepsie, Parkinson, sclérose en plaques, SLA (données 2014-2015, à actualiser).</li>
        </ul>
      </div>
    </div>
  )
}
