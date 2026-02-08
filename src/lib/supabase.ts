import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Missing Supabase config. Copy .env.example to .env and fill in your Supabase credentials.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const TROOP_ID = (import.meta.env.VITE_TROOP_ID as string) || '04326';
export const TROOP_NAME = (import.meta.env.VITE_TROOP_NAME as string) || 'Troop 04326';
export const COUNCIL = (import.meta.env.VITE_COUNCIL as string) || 'GSGLA';
