import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rusddoealshuljdkelqh.supabase.co';
const supabaseAnonKey = 'sb_publishable_XA3fIa8kUNxi8pXJQo0owQ_L3Bgm3eD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);