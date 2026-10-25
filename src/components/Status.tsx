import { useContent } from '../lib/content'

// Affiche le chargement ou l'erreur du catalogue ; null quand le contenu est prêt.
export default function Status() {
  const content = useContent()
  if (content.status === 'loading') {
    return <div className="container loading" role="status">Chargement…</div>
  }
  if (content.status === 'error') {
    return (
      <div className="container loading">
        <div className="notice notice-err" role="alert">
          <p>Le contenu n’a pas pu être chargé. Vérifiez votre connexion, puis rechargez la page.</p>
        </div>
      </div>
    )
  }
  return null
}
