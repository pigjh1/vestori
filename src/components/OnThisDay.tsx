import { useMemo, useState } from 'react'
import type { Entry } from '@/types'
import { formatTime } from '@/utils/date'

function getOnThisDayEntries(entries: Entry[]) {
  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  const years = [1, 2, 3, 5]
  const result: { year: number; ago: string; entries: Entry[] }[] = []

  years.forEach(y => {
    const yr = today.getFullYear() - y
    const dateKey = `${yr}-${mm}-${dd}`
    const found = entries.filter(e => e.createdAt.startsWith(dateKey))
    if (found.length > 0) result.push({ year: yr, ago: `${y}년 전`, entries: found })
  })
  return result
}

export function OnThisDay({ entries }: { entries: Entry[] }) {
  const groups = useMemo(() => getOnThisDayEntries(entries), [entries])
  const [open, setOpen] = useState(true)

  if (groups.length === 0) return null

  const totalCount = groups.reduce((s, g) => s + g.entries.length, 0)

  return (
    <div className="mb-5">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 mb-3 cursor-pointer bg-none border-none p-0 group">
        <span className="text-sm text-ink-muted">🕰 오늘의 회상</span>
        <span className="text-sm text-ink-faint">{totalCount}개</span>
        <div className="flex-1 h-px bg-paper-border" />
        <span className="text-sm text-ink-faint">{open ? '∧' : '∨'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          {groups.map(({ year, ago, entries: items }) => (
            <div key={year} className="bg-paper-card border border-paper-border rounded-sm overflow-hidden">
              <div className="px-4 py-2 bg-paper-warm border-b border-paper-border flex items-center gap-2">
                <span className="text-sm text-ink-muted">{year}년</span>
                <span className="text-xs text-ink-faint">{ago} 오늘</span>
              </div>
              {items.map(entry => (
                <div key={entry.id} className="px-4 py-3 border-b border-paper-border last:border-0">
                  {entry.title && <p className="text-sm text-ink-muted mb-0.5">{entry.title}</p>}
                  <p className="text-base text-ink line-clamp-2 leading-relaxed">{entry.text}</p>
                  <p className="text-sm text-ink-faint mt-1">{formatTime(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
