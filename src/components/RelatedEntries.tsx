import { useMemo, useState } from 'react'
import type { Entry } from '@/types'
import { formatDateFull, formatTime } from '@/utils/date'

interface RelatedEntriesProps {
  entry: Entry
  allEntries: Entry[]
}

export function RelatedEntries({ entry, allEntries }: RelatedEntriesProps) {
  const [open, setOpen] = useState(false)

  const related = useMemo(() => {
    if (!entry.location && entry.tags.length === 0) return []
    return allEntries
      .filter(e => e.id !== entry.id)
      .filter(e => {
        const sameLocation = entry.location && e.location === entry.location
        const sharedTag = entry.tags.some(t => e.tags.includes(t))
        return sameLocation || sharedTag
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
  }, [entry, allEntries])

  if (related.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-paper-border">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink-muted cursor-pointer bg-none border-none p-0 transition-colors mb-2">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M2 6.5h9M7 3l4.5 3.5L7 10"/>
        </svg>
        관련 기록 {related.length}개
        <span>{open ? '∧' : '∨'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-2">
          {related.map(e => {
            const sharedTags = entry.tags.filter(t => e.tags.includes(t))
            const sameLocation = entry.location && e.location === entry.location
            return (
              <div key={e.id} className="rounded-sm bg-paper-warm px-3 py-2 border border-paper-border">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-ink-faint">{formatDateFull(e.createdAt.split('T')[0])} · {formatTime(e.createdAt)}</span>
                  {sameLocation && <span className="text-xs text-ink-faint">📍 {e.location}</span>}
                  {sharedTags.map(t => (
                    <span key={t} className="text-xs text-ink-faint">#{t}</span>
                  ))}
                </div>
                {e.title && <p className="text-sm text-ink-muted">{e.title}</p>}
                <p className="text-sm text-ink line-clamp-2">{e.text}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
