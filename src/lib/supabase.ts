import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être définies (voir .env.example).')
}

// Site public sans compte : aucune session à conserver dans le navigateur.
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})
