/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TROOP_ID: string
  readonly VITE_TROOP_NAME: string
  readonly VITE_COUNCIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
