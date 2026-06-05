import { useMemo } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Entry, CategoryId } from '@/types'
import { EntryCard } from './EntryCard'
import { getDateKey } from '@/utils/date'

interface CalendarTimelineProps {
  entries: Entry[]
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string, category: CategoryId | null, tags: string[], imageIds: string[]) => void
  onTagClick: (tag: string) => void
}

export function CalendarTimeline({ entries, onDelete, onUpdate, onTagClick }: CalendarTimelineProps) {
  const months = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const monthMap = new Map<string, Map<string, Entry[]>>()
    sorted.forEach(e => {
      const mKey = format(new Date(e.createdAt), 'yyyy-MM')
      const dKey = getDateKey(e.createdAt)
      if (!monthMap.has(mKey)) monthMap.set(mKey, new Map())
      const dayMap = monthMap.get(mKey)!
      if (!dayMap.has(dKey)) dayMap.set(dKey, [])
      dayMap.get(dKey)!.push(e)
    })
    return Array.from(monthMap.entries()).map(([mKey, dayMap]) => ({
      mKey,
      label: format(new Date(mKey + '-01'), 'yyyy년 M월', { locale: ko }),
      days: Array.from(dayMap.entries()).map(([dKey, items]) => ({
        dKey,
        label: format(new Date(dKey), 'M월 d일 (EEEEE)', { locale: ko }),
        items,
      })),
    }))
  }, [entries])

  if (entries.length === 0) return null

  return (
    <div>
      {months.map(month => (
        <div key={month.mKey} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-serif text-[13px] italic text-ink-muted whitespace-nowrap">{month.label}</span>
            <div className="flex-1 h-px bg-paper-border" />
          </div>
          {month.days.map(day => (
            <div key={day.dKey} className="flex gap-4 mb-2">
              <div className="w-20 flex-shrink-0 pt-6">
                <span className="font-sans text-[10px] text-ink-faint font-light tracking-wide">{day.label}</span>
              </div>
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="flex flex-col items-center pt-7">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-light flex-shrink-0" />
                  <div className="flex-1 w-px bg-paper-border mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  {day.items.map(entry => (
                    <EntryCard key={entry.id} entry={entry} onDelete={onDelete} onUpdate={onUpdate} onTagClick={onTagClick} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
