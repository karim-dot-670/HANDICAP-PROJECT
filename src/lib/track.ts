import { supabase } from './supabase'

export type TrackedEvent =
  | 'page_view'
  | 'testimony_complete'
  | 'vision3d_open'
  | 'head_open'
  | 'action_click'
  | 'quiz_complete'
  | 'share'

// Mesure sans traceur (RGPD) : identifiant aléatoire gardé en mémoire le temps de la
// visite, jamais écrit dans un cookie ni dans le stockage du navigateur.
const sessionId = crypto.randomUUID()
const sent = new Set<string>()

export function track(event: TrackedEvent, conditionSlug?: string) {
  // Un même événement n'est compté qu'une fois par fiche et par visite.
  const key = `${event}:${conditionSlug ?? ''}`
  if (event !== 'page_view' && sent.has(key)) return
  sent.add(key)
  void supabase
    .from('events')
    .insert({ session_id: sessionId, event, condition_slug: conditionSlug ?? null })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn('track', error.message)
    })
}
