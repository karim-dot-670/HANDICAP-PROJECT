import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => window.matchMedia(query).matches

export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    prefersReducedMotion,
  )
}
