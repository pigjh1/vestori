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
  
  // 파스텔톤 배경색 (매우 낮은 채도, 높은 명도)
  const paperBg = `hsl(${settings.accentHue},12%,96%)`
  const paperWarm = `hsl(${settings.accentHue},10%,93%)`
  const paperBorder = `hsl(${settings.accentHue},15%,85%)`
  
  root.style.setProperty('--color-paper', paperBg)
  root.style.setProperty('--color-paper-warm', paperWarm)
  root.style.setProperty('--color-paper-border', paperBorder)
  
  // 파스텔톤 accent 색상 (낮은 채도, 높은 명도)
  const hsl = `hsl(${settings.accentHue},28%,62%)`
  const hslLight = `hsl(${settings.accentHue},32%,70%)`
  const hslPale = `hsl(${settings.accentHue},35%,94%)`
  
  root.style.setProperty('--color-accent', hsl)
  root.style.setProperty('--color-accent-light', hslLight)
  root.style.setProperty('--color-accent-pale', hslPale)
  
  // 폰트
  const fontFamily = FONT_MAP[settings.font] || FONT_MAP['noto-sans']
  root.style.setProperty('--font-body', fontFamily)
  root.style.setProperty('--font-serif', '"Noto Serif KR", serif')
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
