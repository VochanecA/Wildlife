'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ClearAuthCookiesContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we're getting header size errors
    const checkForHeaderError = () => {
      const error = searchParams.get('error')
      if (error?.includes('431') || error?.includes('header')) {
        // Clear problematic cookies
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim()
          if (name.includes('supabase') || name.includes('auth')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          }
        })
        // Reload the page
        window.location.href = '/'
      }
    }

    checkForHeaderError()
  }, [pathname, searchParams])

  return null
}

export function ClearAuthCookies() {
  return (
    <div style={{ display: 'none' }}>
      <ClearAuthCookiesContent />
    </div>
  )
}