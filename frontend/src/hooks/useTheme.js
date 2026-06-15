import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ui-theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    let dark = true
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) dark = stored === 'dark'
    } catch {
      // localStorage unavailable (private browsing, etc.) — use default
    }
    // Set class synchronously to prevent flash of wrong theme
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark)
    }
    return dark
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    } catch {
      // localStorage unavailable — skip persistence
    }
  }, [isDark])

  return { isDark, toggle: () => setIsDark((v) => !v) }
}
