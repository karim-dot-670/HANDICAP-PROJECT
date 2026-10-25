import { useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import EspaceTemoin from '../components/EspaceTemoin'
import { supabase } from '../lib/supabase'
import { useTitle } from '../lib/useTitle'

type Kind = 'reaction' | 'temoignage' | 'question'
type Errors = Partial<Record<'email' | 'message' | 'consent', string>>

const kinds: { value: Kind; label: string }[] = [
  { value: 'reaction', label: 'Réagir au site' },
  { value: 'temoignage', label: 'Proposer un témoignage' },
  { value: 'question', label: 'Poser une question' },
]

export default function Contact() {
  useTitle('Contact')
  const [params] = useSearchParams()
  const initial = kinds.some((k) => k.value === params.get('sujet')) ? (params.get('sujet') as Kind) : 'reaction'
  const [kind, setKind] = useState<Kind>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const consent = data.get('consent') === 'on'

    const next: Errors = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.'
    if (message.length < 10) next.message = 'Votre message doit faire au moins 10 caractères.'
    if (!consent) next.consent = 'Cochez cette case pour que nous puissions vous répondre.'
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    setState('sending')
    const { error } = await supabase.from('contact_messages').insert({ kind, name: name || null, email, message, consent })
    setState(error ? 'failed' : 'sent')
    window.setTimeout(() => resultRef.current?.focus(), 0)
  }

  if (state === 'sent') {
    return (
      <div className="container" style={{ paddingTop: 64 }}>
        <div ref={resultRef} tabIndex={-1} className="notice notice-ok" role="status" style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 className="h2">Merci, c’est envoyé.</h1>
          <p style={{ color: 'var(--texte-2)' }}>
            {kind === 'temoignage'
              ? 'Nous vous recontacterons pour en parler. Rien ne sera publié sans votre accord écrit, et vous pourrez relire ou retirer votre récit à tout moment.'
              : 'Nous vous répondrons dès que possible.'}
          </p>
        </div>
      </div>
    )
  }

  const describe = (field: keyof Errors, hint?: string) =>
    [hint, errors[field] && `${field}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className="container" style={{ paddingTop: 64 }}>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <span className="overtitle">Contact</span>
        <h1 className="h1">Réagir, témoigner, demander.</h1>
        <p className="lead">
          Une remarque sur le site, une question pour adapter votre commerce, ou l’envie de raconter votre quotidien :
          écrivez-nous.
        </p>
      </div>

      <EspaceTemoin />

      <form ref={formRef} className="form" onSubmit={submit} noValidate>
        <fieldset className="field radio-row">
          <legend>Sujet</legend>
          {kinds.map((k) => (
            <label key={k.value} className="stage-option">
              <input type="radio" name="kind" value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} />
              <span style={{ border: '1px solid var(--ligne-forte)', paddingInline: 18 }}>{k.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="name">Prénom ou pseudonyme <span className="muted">(facultatif)</span></label>
          <input id="name" name="name" className="input" autoComplete="given-name" maxLength={120} />
        </div>

        <div className="field">
          <label htmlFor="email">Adresse e-mail</label>
          <span id="email-hint" className="hint">Uniquement pour vous répondre.</span>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required
            aria-invalid={!!errors.email} aria-describedby={describe('email', 'email-hint')} />
          {errors.email && <span id="email-error" className="error-text">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="message">Votre message</label>
          {kind === 'temoignage' && (
            <span id="message-hint" className="hint">
              Quelques lignes suffisent : quel handicap ou quelle maladie, et ce que vous aimeriez que les gens comprennent.
            </span>
          )}
          <textarea id="message" name="message" className="input" required maxLength={5000}
            aria-invalid={!!errors.message} aria-describedby={describe('message', kind === 'temoignage' ? 'message-hint' : undefined)} />
          {errors.message && <span id="message-error" className="error-text">{errors.message}</span>}
        </div>

        <div className="field">
          <div className="check">
            <input id="consent" name="consent" type="checkbox" aria-invalid={!!errors.consent} aria-describedby={describe('consent')} />
            <label htmlFor="consent" style={{ fontWeight: 400 }}>
              J’accepte que ces informations soient utilisées uniquement pour répondre à mon message.
              Elles ne sont ni partagées ni utilisées à d’autres fins.
            </label>
          </div>
          {errors.consent && <span id="consent-error" className="error-text">{errors.consent}</span>}
        </div>

        {state === 'failed' && (
          <div ref={resultRef} tabIndex={-1} className="notice notice-err" role="alert">
            L’envoi a échoué. Vérifiez votre connexion et réessayez.
          </div>
        )}

        <div>
          <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  )
}
