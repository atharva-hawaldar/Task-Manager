import { createClient } from '@supabase/supabase-js'

// 1. Double check these exactly from: Settings -> API
const supabaseUrl = 'https://rusddoealshuljdkelqh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2Rkb2VhbHNodWxqZGtlbHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDU1NTgsImV4cCI6MjA5MDAyMTU1OH0.f9nvCBp5ZCZAcjeyL4nR6tDF1q3KnbtmdiW1gypQjxc' 

// 2. Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})