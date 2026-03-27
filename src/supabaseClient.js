import { createClient } from '@supabase/supabase-js'

// Replace these strings with the actual values from your Supabase Dashboard
// Settings -> API -> Project URL & anon public key
const supabaseUrl = 'https://rusddoealshuljdkelqh.supabase.co'
const supabaseAnonKey = 'your-actual-anon-key-string-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)