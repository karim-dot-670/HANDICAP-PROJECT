import { useState } from 'react'

// Espace témoin sans mot de passe (passkey WebAuthn), d'après la maquette.
// Prototype côté navigateur : l'identifiant de la passkey est gardé sur l'appareil ;
// la vérification serveur et l'espace de relecture restent à brancher sur Supabase Auth.
const STORAGE_KEY = 'av-passkey'

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))
const toBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

function readId() {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}
function saveId(id: string) {
  try { localStorage.setItem(STORAGE_KEY, id) } catch { /* stockage indisponible */ }
}

export default function EspaceTemoin() {
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null)

  const create = async () => {
    try {
      if (!window.PublicKeyCredential) throw new Error('unsupported')
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: random(32),
          rp: { name: 'Autrement vu' },
          user: { id: random(16), name: 'temoin', displayName: 'Témoin' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
          timeout: 60000,
        },
      })) as PublicKeyCredential
      saveId(toBase64(credential.rawId))
      setMsg({ text: 'Passkey créée sur cet appareil. Vous pourrez vous connecter d’un geste.', error: false })
    } catch (e) {
      const cancelled = e instanceof Error && e.name === 'NotAllowedError'
      setMsg(cancelled
        ? { text: 'Création annulée.', error: true }
        : { text: 'Ce navigateur ne permet pas de créer une passkey. Essayez avec un navigateur récent.', error: true })
    }
  }

  const signIn = async () => {
    const id = readId()
    if (!id) {
      setMsg({ text: 'Aucune passkey sur cet appareil. Créez-en une d’abord.', error: true })
      return
    }
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: random(32),
          allowCredentials: [{ type: 'public-key', id: fromBase64(id) }],
          userVerification: 'required',
        },
      })
      setMsg({ text: 'Connecté. Bienvenue dans votre espace témoin.', error: false })
    } catch (e) {
      const cancelled = e instanceof Error && e.name === 'NotAllowedError'
      setMsg({ text: cancelled ? 'Connexion annulée.' : 'La connexion a échoué. Réessayez.', error: true })
    }
  }

  return (
    <section className="panel" aria-labelledby="espace-temoin-title" style={{ maxWidth: 640, marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h2 id="espace-temoin-title" className="overtitle" style={{ color: 'var(--lime)', margin: 0 }}>Espace témoin</h2>
        <span className="tag">sans mot de passe</span>
      </div>
      <p className="muted">
        Relisez, modifiez ou retirez votre récit à tout moment. Votre passkey utilise l’empreinte, le visage ou le code
        de votre appareil : rien à retenir.
      </p>
      <div className="btn-row">
        <button type="button" className="btn btn-primary btn-sm" onClick={create}>Créer ma passkey</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={signIn}>Me connecter</button>
      </div>
      <p aria-live="polite" style={{ margin: 0, fontSize: 15, color: msg?.error ? 'var(--corail)' : 'var(--lime)' }}>
        {msg?.text}
      </p>
    </section>
  )
}
