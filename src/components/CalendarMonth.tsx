import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Entry } from '@/types'

interface CalendarMonthProps {
  entries: Entry[]
  onDayClick: (dateKey: string) => void
  selectedDateKey: string | null
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarMonth({ entries, onDayClick, selectedDateKey }: CalendarMonthProps) {
  const [current, setCurrent] = useState(new Date())

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0=일

  // 날짜별 기록 수 맵
  const countMap = entries.reduce<Record<string, number>>((acc, e) => {
    const key = format(new Date(e.createdAt), 'yyyy-MM-dd')
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="bg-white border border-paper-border rounded-sm mb-6 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-paper-border">
        <button onClick={() => setCurrent(subMonths(current, 1))}
          className="font-sans text-[12px] text-ink-faint hover:text-ink cursor-pointer bg-none border-none px-1">←</button>
        <span className="font-serif text-[14px] italic text-ink-muted">
          {format(current, 'yyyy년 M월', { locale: ko })}
        </span>
        <button onClick={() => setCurrent(addMonths(current, 1))}
          className="font-sans text-[12px] text-ink-faint hover:text-ink cursor-pointer bg-none border-none px-1">→</button>
      </div>

      <div className="p-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center font-sans text-[10px] text-ink-faint font-light py-1">{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const count = countMap[key] ?? 0
            const selected = selectedDateKey === key
            const today = isToday(day)
            return (
              <button key={key} onClick={() => onDayClick(key)}
                className={`relative flex flex-col items-center py-1 rounded-sm transition-all cursor-pointer bg-none border-none
                  ${selected ? 'bg-accent-pale' : 'hover:bg-paper-warm'}`}>
                <span className={`font-sans text-[12px] font-light leading-none
                  ${today ? 'text-accent font-normal' : 'text-ink-muted'}
                  ${selected ? 'font-normal' : ''}`}>
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <span className={`mt-0.5 w-1 h-1 rounded-full ${selected ? 'bg-accent' : 'bg-accent-light'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
