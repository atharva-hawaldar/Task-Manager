    import { createClient } from '@supabase/supabase-js'

    // Pulling variables from the .env file
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Error check to ensure the client doesn't break if keys are missing
    if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing! Check your .env file.")
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)