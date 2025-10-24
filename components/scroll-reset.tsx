// components/scroll-reset.tsx
"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollReset() {
  const pathname = usePathname()

  useEffect(() => {
    // Resetuj skrol na vrh kada se promeni ruta
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}