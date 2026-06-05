import type { PageMode } from '@/hooks/useFilter'
type AnyPage = PageMode | 'stats'

interface NavItem {
  page: PageMode
  label: string
  icon: JSX.Element
}

const Icons = {
  records: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  mood: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 12.5 C7.5 13.5 9 14.5 10 14.5 C11 14.5 12.5 13.5 13 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7.5" cy="8.5" r="1" fill="currentColor"/>
      <circle cx="12.5" cy="8.5" r="1" fill="currentColor"/>
    </svg>
  ),
  stats: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="11" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="8" y="7" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.7"/>
      <rect x="13" y="3" width="3" height="14" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  routine: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12.5 14.5 L13.8 16 L16.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15 10.5A6 6 0 0 1 7.5 3a6 6 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const NAV_ITEMS: NavItem[] = [
  { page: 'records', label: '기록',   icon: Icons.records },
  { page: 'mood',    label: '기분',   icon: Icons.mood },

  { page: 'routine', label: '루틴',   icon: Icons.routine },
]

interface SidebarProps {
  pageMode: AnyPage
  onSelect: (page: AnyPage) => void
  dark: boolean
  onToggleDark: () => void
}

export function Sidebar({ pageMode, onSelect, dark, onToggleDark }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 flex flex-col items-center py-5 z-30
      bg-paper border-r border-paper-border transition-colors duration-300">

      <div className="mb-7 flex-shrink-0">
        <span className="font-serif text-[22px] italic text-accent leading-none select-none">V</span>
      </div>

      <nav className="flex flex-col items-center gap-0.5 flex-1">
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const active = pageMode === page
          return (
            <button key={page} onClick={() => onSelect(page)} title={label}
              className={`group relative w-11 h-11 flex items-center justify-center rounded-md
                transition-all duration-150 cursor-pointer
                ${active ? 'bg-accent-pale text-accent' : 'text-ink-faint hover:text-ink hover:bg-paper-warm'}`}>
              {icon}
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />}
              <span className="absolute left-[52px] px-2.5 py-1.5 bg-ink text-paper font-sans text-[11px]
                rounded-md whitespace-nowrap opacity-0 pointer-events-none shadow-lg
                group-hover:opacity-100 transition-opacity duration-150 z-50">
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-0.5">
        <button onClick={() => onSelect('stats')} title="통계"
          className={`group relative w-11 h-11 flex items-center justify-center rounded-md
            transition-all duration-150 cursor-pointer
            ${pageMode === 'stats' ? 'bg-accent-pale text-accent' : 'text-ink-faint hover:text-ink hover:bg-paper-warm'}`}>
          {Icons.stats}
          {pageMode === 'stats' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />}
          <span className="absolute left-[52px] px-2.5 py-1.5 bg-ink text-paper font-sans text-[11px]
            rounded-md whitespace-nowrap opacity-0 pointer-events-none shadow-lg
            group-hover:opacity-100 transition-opacity duration-150 z-50">통계</span>
        </button>
        <button onClick={() => onSelect('settings')} title="설정"
          className={`group relative w-11 h-11 flex items-center justify-center rounded-md
            transition-all duration-150 cursor-pointer
            ${pageMode === 'settings' ? 'bg-accent-pale text-accent' : 'text-ink-faint hover:text-ink hover:bg-paper-warm'}`}>
          {Icons.settings}
          {pageMode === 'settings' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />}
          <span className="absolute left-[52px] px-2.5 py-1.5 bg-ink text-paper font-sans text-[11px]
            rounded-md whitespace-nowrap opacity-0 pointer-events-none shadow-lg
            group-hover:opacity-100 transition-opacity duration-150 z-50">설정</span>
        </button>

        <button onClick={onToggleDark} title={dark ? '라이트 모드' : '다크 모드'}
          className="w-11 h-11 flex items-center justify-center rounded-md text-ink-faint
            hover:text-ink hover:bg-paper-warm transition-all duration-150 cursor-pointer">
          {dark ? Icons.sun : Icons.moon}
        </button>
      </div>
    </aside>
  )
}
