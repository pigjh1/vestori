import { useState, useEffect } from 'react'
import type { DesignSettings, FontFamily } from '@/types'

const STORAGE_KEY = 'vestori:design'

const FONT_VARS: Record<FontFamily, string> = {
  default: '"DM Serif Display", "Noto Serif KR", serif',
  gothic:  '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
  mono:    '"JetBrains Mono", "Fira Code", "Courier New", monospace',
}

const DEFAULTS: DesignSettings = { font: 'default', accentHue: 25 }

function load(): DesignSettings {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS }
  catch { return DEFAULTS }
}

function applyDesign(s: DesignSettings) {
  const root = document.documentElement
  // 폰트
  root.style.setProperty('--font-body', FONT_VARS[s.font])
  root.style.setProperty('--font-serif', FONT_VARS[s.font])
  // 악센트 색상 (HSL hue만 바꿔서 자연스럽게)
  root.style.setProperty('--color-accent',       `hsl(${s.accentHue}, 45%, 35%)`)
  root.style.setProperty('--color-accent-light',  `hsl(${s.accentHue}, 38%, 55%)`)
  root.style.setProperty('--color-accent-pale',   `hsl(${s.accentHue}, 40%, 92%)`)
  // 다크모드
  if (root.classList.contains('dark')) {
    root.style.setProperty('--color-accent',      `hsl(${s.accentHue}, 42%, 62%)`)
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

  const setFont = (font: FontFamily) => setSettings(prev => ({ ...prev, font }))
  const setAccentHue = (hue: number) => setSettings(prev => ({ ...prev, accentHue: hue }))
  const reset = () => setSettings(DEFAULTS)

  return { settings, setFont, setAccentHue, reset }
}
