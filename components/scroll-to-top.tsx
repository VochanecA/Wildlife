"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    // Kad se ruta promijeni, skroluj na vrh
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pathname])

  return null
}