import { useState, useEffect } from 'react'
import type { DesignSettings, FontFamily } from '@/types'

const STORAGE_KEY = 'vestori:design'

const FONT_MAP: Record<FontFamily, string> = {
  'noto-sans': '"Noto Sans KR", sans-serif',
  'noto-serif': '"Noto Serif KR", serif',
  'gowun-batang': '"Gowun Batang", serif',
  'gowun-dodum': '"Gowun Dodum", sans-serif',
  'noto-brush': '"Nanum Brush Script", cursive',
  'noto-pen': '"Nanum Pen Script", cursive',
  'jetbrains-mono': '"JetBrains Mono", monospace',
}

function loadSettings(): DesignSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { font: 'noto-sans', accentHue: 28 }
    const parsed = JSON.parse(raw) as DesignSettings
    return { ...parsed, font: parsed.font ?? 'noto-sans' }
  } catch {
    return { font: 'noto-sans', accentHue: 28 }
  }
}

function applyDesign(settings: DesignSettings) {
  const root = document.documentElement
  const h = settings.accentHue
  const isDark = root.classList.contains('dark')

  // 파스텔 accent
  root.style.setProperty('--color-accent',        `hsl(${h}, 40%, ${isDark ? 72 : 68}%)`)
  root.style.setProperty('--color-accent-light',   `hsl(${h}, 38%, ${isDark ? 80 : 76}%)`)
  root.style.setProperty('--color-accent-pale',    `hsl(${h}, 30%, ${isDark ? 18 : 95}%)`)

  // 배경색 (라이트/다크 분기)
  if (isDark) {
    root.style.setProperty('--color-paper',        `hsl(${h}, 8%, 10%)`)
    root.style.setProperty('--color-paper-warm',   `hsl(${h}, 8%, 13%)`)
    root.style.setProperty('--color-paper-border', `hsl(${h}, 10%, 20%)`)
    root.style.setProperty('--color-paper-card',   `hsl(${h}, 8%, 15%)`)
  } else {
    root.style.setProperty('--color-paper',        `hsl(${h}, 10%, 97%)`)
    root.style.setProperty('--color-paper-warm',   `hsl(${h}, 10%, 94%)`)
    root.style.setProperty('--color-paper-border', `hsl(${h}, 12%, 87%)`)
    root.style.setProperty('--color-paper-card',   '#ffffff')
  }

  // 폰트
  const fontFamily = FONT_MAP[settings.font] || FONT_MAP['noto-sans']
  root.style.setProperty('--font-body', fontFamily)
}

export function useDesign() {
  const [settings, setSettings] = useState<DesignSettings>(loadSettings)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch {}
    applyDesign(settings)
  }, [settings])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyDesign(settings)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [settings])

  return {
    settings,
    setFont: (font: FontFamily) => setSettings(prev => ({ ...prev, font })),
    setAccentHue: (hue: number) => setSettings(prev => ({ ...prev, accentHue: hue })),
    reset: () => setSettings({ font: 'noto-sans', accentHue: 28 }),
  }
}
