type Env = {
  VITE_PUBLIC_SUPABASE_URL: string
  VITE_PUBLIC_SUPABASE_ANON_KEY: string
  API_KEY?: string
}

export const env: Env = {
  VITE_PUBLIC_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  VITE_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  API_KEY: import.meta.env.VITE_API_KEY,
}

export function validateEnv() {
  const required = [
    'VITE_PUBLIC_SUPABASE_URL',
    'VITE_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter((key) => !import.meta.env[key])

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables: ${missing.join(', ')}`
    )
  }
}
