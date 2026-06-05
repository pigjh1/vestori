import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { PageMode, RecordView } from '@/hooks/useFilter'
type AnyPage = PageMode | 'stats'

const PAGE_TITLES: Record<AnyPage, { title: string; sub: string }> = {
  records:  { title: '기록',   sub: '삶의 흔적이 이야기가 되는 공간' },
  mood:     { title: '기분',   sub: '하루하루의 감정을 추적해요' },
  stats:    { title: '통계',   sub: '기록이 만들어낸 패턴들' },
  routine:  { title: '루틴',   sub: '매일의 습관을 만들어가요' },
  settings: { title: '설정',   sub: '내보내기 및 데이터 관리' },
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
}

const VIEW_LABELS: Record<RecordView, string> = {
  feed: '피드',
  calendar: '달력',
  timeline: '타임라인',
}

interface HeaderProps {
  pageMode: AnyPage
  recordView?: RecordView
  onRecordViewChange?: (v: RecordView) => void
}

export function Header({ pageMode, recordView, onRecordViewChange }: HeaderProps) {
  const today = format(new Date(), 'yyyy.MM.dd (E)', { locale: ko })
  const { title, sub } = PAGE_TITLES[pageMode]

  return (
    <header className="pt-10 pb-8 mb-8 border-b border-paper-border">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-[26px] italic text-ink tracking-tight leading-none mb-1.5">
            {title}
          </h2>
          <p className="font-sans text-[11px] font-light text-ink-faint tracking-[0.06em]">{sub}</p>
        </div>

        <div className="flex items-center gap-3 mt-1">
          {/* 뷰 토글 — 기록 페이지에서만 */}
          {pageMode === 'records' && recordView && onRecordViewChange && (
            <div className="flex items-center gap-0.5 bg-paper-warm border border-paper-border rounded-md p-0.5">
              {(Object.keys(VIEW_ICONS) as RecordView[]).map(v => (
                <button key={v} onClick={() => onRecordViewChange(v)} title={VIEW_LABELS[v]}
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer
                    ${recordView === v
                      ? 'bg-white text-accent shadow-sm'
                      : 'text-ink-faint hover:text-ink'}`}>
                  {VIEW_ICONS[v]}
                </button>
              ))}
            </div>
          )}
          <span className="font-sans text-[11px] text-ink-faint font-light tracking-wide">{today}</span>
        </div>
      </div>
    </header>
  )
}
