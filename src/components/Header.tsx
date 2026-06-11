import { todayKey, formatDateFull } from '@/utils/date'
import type { PageMode, RecordView } from '@/hooks/useFilter'

type AnyPage = PageMode

const PAGE_TITLES: Record<AnyPage, { title: string; sub: string }> = {
  records:    { title: '기록',    sub: '삶의 흔적이 이야기가 되는 공간' },
  mood:       { title: '기분',    sub: '하루하루의 감정을 추적해요' },
  routine:    { title: '루틴',    sub: '매일의 습관을 만들어가요' },
  diet:       { title: '식단',    sub: '하루 먹은 것을 기록해요' },
  retrospect: { title: '회고',    sub: '지나온 시간을 돌아보는 공간' },
  settings:   { title: '설정',    sub: '디자인 · 내보내기 · 데이터' },
}

const VIEW_ICONS: Record<RecordView, JSX.Element> = {
  feed: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line x1="2" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="2" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="2" y1="11.5" x2="7" y2="11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2" y="3" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="2" y1="6.5" x2="13" y2="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="5.5" y1="1.5" x2="5.5" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="9.5" y1="1.5" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  timeline: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="4" cy="3.5" r="1.2" fill="currentColor"/>
      <circle cx="4" cy="7.5" r="1.2" fill="currentColor"/>
      <circle cx="4" cy="11.5" r="1.2" fill="currentColor"/>
      <line x1="4" y1="4.7" x2="4" y2="6.3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="4" y1="8.7" x2="4" y2="10.3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="6.5" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.5" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6.5" y1="11.5" x2="9" y2="11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  photos: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="3" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="5" cy="6.5" r="1.3" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1.5 10l3-3 2.5 2.5 2.5-3L13 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  places: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5C5.0 1.5 3 3.5 3 6c0 3.5 4.5 7.5 4.5 7.5S12 9.5 12 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="7.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
}

const VIEW_LABELS: Record<RecordView, string> = { feed: '기본', calendar: '달력', timeline: '타임라인', photos: '사진', places: '지도' }

const VIEW_ORDER: RecordView[] = ['feed', 'timeline', 'calendar', 'photos', 'places']

interface HeaderProps {
  pageMode: AnyPage
  recordView?: RecordView
  onRecordViewChange?: (v: RecordView) => void
}

export function Header({ pageMode, recordView, onRecordViewChange }: HeaderProps) {
  const today = formatDateFull(todayKey())
  const { title, sub } = PAGE_TITLES[pageMode]

  return (
    <header className="pt-8 pb-6 mb-6 border-b border-paper-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl italic text-ink tracking-tight leading-none mb-1.5">{title}</h2>
          <p className="text-xs text-ink-faint tracking-[0.05em] leading-snug">{sub}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {pageMode === 'records' && recordView && onRecordViewChange && (
            <div className="flex items-center gap-0.5 bg-paper-warm border border-paper-border rounded-md p-0.5">
              {VIEW_ORDER.map(v => (
                <button key={v} onClick={() => onRecordViewChange(v)} title={VIEW_LABELS[v]}
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] transition-all cursor-pointer
                    ${recordView === v ? 'bg-paper-card text-ink shadow-sm' : 'text-ink-faint hover:text-ink'}`}>
                  {VIEW_ICONS[v]}
                </button>
              ))}
            </div>
          )}
          <span className="text-xs text-ink-faint hidden sm:block">{today}</span>
        </div>
      </div>
    </header>
  )
}
