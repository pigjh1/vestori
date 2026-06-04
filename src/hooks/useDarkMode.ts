import { useState, useEffect } from 'react'

const STORAGE_KEY = 'vestori:darkMode'

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) return stored === 'true'
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem(STORAGE_KEY, String(dark)) } catch {}
  }, [dark])

  const toggle = () => setDark(v => !v)
  return { dark, toggle }
}
