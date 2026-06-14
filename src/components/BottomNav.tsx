import type { PageMode } from '@/hooks/useFilter'

type AnyPage = PageMode

const Icons: Record<string, JSX.Element> = {
  records: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="4" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="4" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="4" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  mood: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 13.5C8.5 14.5 9.8 15.5 11 15.5C12.2 15.5 13.5 14.5 14 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="8.5" cy="9.5" r="1.1" fill="currentColor"/>
      <circle cx="13.5" cy="9.5" r="1.1" fill="currentColor"/>
    </svg>
  ),
  routine: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M13.5 16L15.2 17.8L18.5 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  diet: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 8c0-2.5 3-5 7-5s7 2.5 7 5c0 1.5-.8 2.8-2 3.7V18H6v-6.3C4.8 10.8 4 9.5 4 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <line x1="11" y1="3" x2="11" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  retrospect: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 11C4 7.13 7.13 4 11 4C14.87 4 18 7.13 18 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <polyline points="4,11 4,7 8,7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="11" y1="11" x2="11" y2="15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="1.4" fill="currentColor"/>
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="2.8" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M11 3.5v2M11 16.5v2M3.5 11h2M16.5 11h2M5.6 5.6l1.4 1.4M15 15l1.4 1.4M5.6 16.4l1.4-1.4M15 7l1.4-1.4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const NAV_ITEMS: { page: AnyPage; label: string }[] = [
  { page: 'records',    label: '기록' },
  { page: 'mood',       label: '기분' },
  { page: 'routine',    label: '루틴' },
  { page: 'diet',       label: '식단' },
  { page: 'retrospect', label: '회고' },
  { page: 'settings',   label: '설정' },
]

interface BottomNavProps {
  pageMode: AnyPage
  onSelect: (p: AnyPage) => void
}

export function BottomNav({ pageMode, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom"
      style={{ background: 'var(--color-paper)', borderTop: '1px solid var(--color-paper-border)' }}>
      <div className="max-w-lg mx-auto flex items-center">
        {NAV_ITEMS.map(({ page, label }) => {
          const active = pageMode === page
          return (
            <button key={page} onClick={() => onSelect(page)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 cursor-pointer border-none bg-none transition-colors"
              style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink-faint)' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 26,
                borderRadius: 13,
                background: active ? 'color-mix(in srgb, var(--color-ink) 10%, transparent)' : 'transparent',
                transition: 'background 0.2s ease',
              }}>
                {Icons[page]}
              </span>
              <span className="text-xs leading-none" style={{
                fontWeight: active ? 600 : 400,
                fontSize: 10,
              }}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
