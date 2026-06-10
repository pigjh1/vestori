import { useState } from 'react'
import { getDateKey, todayKey, isFutureDate, getDayOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from '@/utils/date'
import type { Entry } from '@/types'

const WEEKDAYS = ['일','월','화','수','목','금','토']
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

interface CalendarMonthProps {
  entries: Entry[]
  onDayClick: (dateKey: string) => void
  selectedDateKey: string | null
}

export function CalendarMonth({ entries, onDayClick, selectedDateKey }: CalendarMonthProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const monthStart = startOfMonth(new Date(year, month, 1))
  const monthEnd = endOfMonth(new Date(year, month, 1))
  const days = eachDayOfInterval(monthStart, monthEnd)
  const startPad = getDayOfWeek(getDateKey(monthStart.toISOString()))

  const countMap = entries.reduce<Record<string, number>>((acc, e) => {
    const k = getDateKey(e.createdAt); acc[k] = (acc[k] ?? 0) + 1; return acc
  }, {})

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  return (
    <div className="bg-paper-card border border-paper-border rounded-sm mb-5">
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper-border">
        <button onClick={prevMonth} className="text-ink-faint hover:text-ink cursor-pointer bg-none border-none px-2 py-1 text-sm">←</button>
        <span className="text-sm italic text-ink-muted">{year}년 {MONTHS[month]}</span>
        <button onClick={nextMonth} className="text-ink-faint hover:text-ink cursor-pointer bg-none border-none px-2 py-1 text-sm">→</button>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => <div key={d} className="text-center text-sm text-ink-faint py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
          {days.map(day => {
            const key = getDateKey(day.toISOString())
            const count = countMap[key] ?? 0
            const selected = selectedDateKey === key
            const today = key === todayKey()
            const future = isFutureDate(key)
            return (
              <button key={key} onClick={() => !future && onDayClick(key)}
                className={`flex flex-col items-center py-1 rounded-sm transition-all cursor-pointer bg-none border-none
                  ${selected ? 'bg-ink/8' : 'hover:bg-paper-warm'} ${future ? 'opacity-25 cursor-default' : ''}`}>
                <span className={`text-xs leading-none ${today ? 'text-accent font-medium' : 'text-ink-muted'}`}>
                  {day.getDate()}
                </span>
                {count > 0 && <span className={`mt-0.5 w-1 h-1 rounded-full ${selected ? 'bg-accent' : 'bg-accent-light'}`} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
