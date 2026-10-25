import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'

export type VisionKind =
  | 'auditive' | 'moteur' | 'visuelle' | 'autisme'
  | 'dys' | 'tdah' | 'alzheimer' | 'intellectuelle' | 'epilepsie' | 'parkinson' | 'sep' | 'sla' | 'schizophrenie'

export interface Stage {
  id: number
  position: number
  label: string
  description: string
  thoughts: string[]
  intensity: number
}

export interface Gesture {
  id: number
  position: number
  kind: 'aider' | 'eviter' | 'amenager'
  title: string
  body: string
}

export interface Testimony {
  id: number
  witness_name: string
  witness_age: number | null
  is_pseudonym: boolean
  is_example: boolean
  portrait_url: string | null
  media_url: string | null
  media_kind: 'video' | 'audio' | null
  captions_url: string | null
  quote: string
  transcript: string
  day_story: string[]
}

export interface Condition {
  slug: string
  rank: number
  name: string
  prevalence: string
  prevalence_unverified: boolean
  scale_label: string
  stages_summary: string
  intro: string
  scene_title: string
  scene_description: string
  vision_warning: string
  vision_kind: VisionKind | null
  invisible: boolean
  stages: Stage[]
  gestures: Gesture[]
  testimonies: Testimony[]
}

type ContentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; conditions: Condition[] }

const ContentContext = createContext<ContentState>({ status: 'loading' })

// Tout le catalogue est chargé en une fois (quelques dizaines de Ko) : la fiche peut
// ainsi s'afficher immédiatement, ce qui permet la transition carte → fiche.
async function fetchConditions(): Promise<Condition[]> {
  const { data, error } = await supabase
    .from('conditions')
    .select('*, stages(*), gestures(*), testimonies(*)')
    .order('rank')
    .order('position', { referencedTable: 'stages' })
    .order('position', { referencedTable: 'gestures' })
  if (error) throw error
  return data as Condition[]
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({ status: 'loading' })

  useEffect(() => {
    fetchConditions()
      .then((conditions) => setState({ status: 'ready', conditions }))
      .catch((e: unknown) =>
        setState({ status: 'error', message: e instanceof Error ? e.message : String(e) }),
      )
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export function useContent() {
  return useContext(ContentContext)
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

// Teinte du halo de chaque carte, pour distinguer les scènes sans image.
const glows: Record<string, string> = {
  surdite: '#4a3522', dys: '#3f3524', moteur: '#4a2f22', tdah: '#463a1e', visuelle: '#2f3a2a',
  alzheimer: '#40302a', autisme: '#2e3830', 'deficience-intellectuelle': '#45352a',
  schizophrenie: '#36303a', epilepsie: '#3d3422', parkinson: '#4a3326', sep: '#33352c', sla: '#3a2e2a',
}
export const glowFor = (slug: string) => glows[slug] ?? '#4a3522'
