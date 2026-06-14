import { useMemo } from 'react'
import type { Entry, CategoryId, CategoryMeta, ThreadPost } from '@/types'
import { EntryCard } from './EntryCard'
import { getDateKey, getMonthKey, formatMonthLabel, formatMonthDayWeek } from '@/utils/date'

interface Props {
  entries: Entry[]
  getPosts: (entryId: string) => ThreadPost[]
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string, text: string, category: CategoryId | null, categoryMeta: CategoryMeta, tags: string[], imageIds: string[], location: string) => void
  onTagClick: (tag: string) => void
  onAddPost: (entryId: string, text: string, imageIds: string[]) => void
  onDeletePost: (id: string) => void
}

export function CalendarTimeline({ entries, getPosts, onDelete, onUpdate, onTagClick, onAddPost, onDeletePost }: Props) {
  const months = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const monthMap = new Map<string, Map<string, Entry[]>>()
    sorted.forEach(e => {
      const mKey = getMonthKey(getDateKey(e.createdAt))
      const dKey = getDateKey(e.createdAt)
      if (!monthMap.has(mKey)) monthMap.set(mKey, new Map())
      const dm = monthMap.get(mKey)!
      if (!dm.has(dKey)) dm.set(dKey, [])
      dm.get(dKey)!.push(e)
    })
    return Array.from(monthMap.entries()).map(([mKey, dayMap]) => ({
      mKey, label: formatMonthLabel(mKey),
      days: Array.from(dayMap.entries()).map(([dKey, items]) => ({
        dKey, label: formatMonthDayWeek(dKey), items,
      })),
    }))
  }, [entries])

  if (entries.length === 0) return null

  return (
    <div>
      {months.map(month => (
        <div key={month.mKey} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-ink-muted whitespace-nowrap">{month.label}</span>
            <div className="flex-1 h-px bg-paper-border" />
          </div>
          {month.days.map(day => (
            <div key={day.dKey} className="flex gap-3 mb-2">
              <div className="w-14 flex-shrink-0 pt-6">
                <span className="text-xs text-ink-faint leading-tight">{day.label}</span>
              </div>
              <div className="flex gap-2 flex-1 min-w-0">
                <div className="flex flex-col items-center pt-7">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-light flex-shrink-0" />
                  <div className="flex-1 w-px bg-paper-border mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  {day.items.map(entry => (
                    <EntryCard key={entry.id} entry={entry} posts={getPosts(entry.id)}
                      onDelete={onDelete} onUpdate={onUpdate} onTagClick={onTagClick}
                      onAddPost={onAddPost} onDeletePost={onDeletePost} />
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
