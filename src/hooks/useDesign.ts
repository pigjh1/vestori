import { useState, useEffect } from 'react'
import type { DesignSettings, FontFamily } from '@/types'

const STORAGE_KEY = 'vestori:design'

const FONT_VARS: Record<FontFamily, string> = {
  sans:      '"Noto Sans KR", sans-serif',
  grotesque: '"Outfit", "Noto Sans KR", sans-serif',
  mono:      '"JetBrains Mono", "Noto Sans Mono", monospace',
}

const DEFAULTS: DesignSettings = { font: 'sans', accentHue: 25 }

function load(): DesignSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch { return DEFAULTS }
}

function applyDesign(s: DesignSettings) {
  const root = document.documentElement
  
  // 폰트 적용
  root.style.setProperty('--font-body', FONT_VARS[s.font])
  root.style.setProperty('--font-serif', FONT_VARS[s.font])
  
  // 라이트모드 색상
  const isDark = root.classList.contains('dark')
  
  if (!isDark) {
    root.style.setProperty('--color-accent',       `hsl(${s.accentHue}, 45%, 35%)`)
    root.style.setProperty('--color-accent-light',  `hsl(${s.accentHue}, 38%, 55%)`)
    root.style.setProperty('--color-accent-pale',   `hsl(${s.accentHue}, 40%, 92%)`)
  } else {
    // 다크모드 색상
    root.style.setProperty('--color-accent',       `hsl(${s.accentHue}, 42%, 62%)`)
    root.style.setProperty('--color-accent-light', `hsl(${s.accentHue}, 38%, 40%)`)
    root.style.setProperty('--color-accent-pale',  `hsl(${s.accentHue}, 30%, 18%)`)
  }
}

export function useDesign() {
  const [settings, setSettings] = useState<DesignSettings>(load)

  useEffect(() => {
    applyDesign(settings)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch {}
  }, [settings])

  // 다크모드 전환 시에도 색상 재적용
  useEffect(() => {
    const handleDarkModeChange = () => {
      applyDesign(settings)
    }
    window.addEventListener('storage', handleDarkModeChange)
    // MutationObserver로 dark 클래스 감지
    const observer = new MutationObserver(handleDarkModeChange)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.removeEventListener('storage', handleDarkModeChange)
      observer.disconnect()
    }
  }, [settings])

  const setFont = (font: FontFamily) => setSettings(prev => ({ ...prev, font }))
  const setAccentHue = (hue: number) => setSettings(prev => ({ ...prev, accentHue: hue }))
  const reset = () => setSettings(DEFAULTS)

  return { settings, setFont, setAccentHue, reset }
}
