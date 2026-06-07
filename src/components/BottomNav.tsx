import type { PageMode } from '@/hooks/useFilter'

type AnyPage = PageMode | 'stats'

const Icons = {
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
  stats: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="13" width="4" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="9" y="9" width="4" height="10" rx="0.5" fill="currentColor" opacity="0.7"/>
      <rect x="15" y="4" width="4" height="15" rx="0.5" fill="currentColor"/>
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

const NAV_ITEMS: { page: AnyPage; label: string; icon: JSX.Element }[] = [
  { page: 'records',  label: '기록',  icon: Icons.records },
  { page: 'mood',     label: '기분',  icon: Icons.mood },
  { page: 'routine',  label: '루틴',  icon: Icons.routine },
  { page: 'stats',    label: '통계',  icon: Icons.stats },
  { page: 'settings', label: '설정',  icon: Icons.settings },
]

interface BottomNavProps {
  pageMode: AnyPage
  onSelect: (p: AnyPage) => void
}

export function BottomNav({ pageMode, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30
      bg-paper/95 backdrop-blur-sm border-t border-paper-border
      flex items-stretch transition-colors duration-300
      safe-bottom">
      {NAV_ITEMS.map(({ page, label, icon }) => {
        const active = pageMode === page
        return (
          <button key={page} onClick={() => onSelect(page)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all cursor-pointer border-none
              ${active ? 'text-accent' : 'text-ink-faint hover:text-ink'}`}>
            <span className="relative">
              {icon}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </span>
            <span className={`font-sans leading-none transition-all
              ${active ? 'text-[10px] font-medium' : 'text-[10px] font-light'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
