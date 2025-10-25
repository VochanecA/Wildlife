// "use server" //dodao za serverski kod 25.10.2025
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (value && value.length > 4000) {
                // Skip setting overly large cookies
                console.warn('Skipping large cookie:', name)
                return
              }
              cookieStore.set(name, value, { ...options, path: '/' })
            })
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )
}