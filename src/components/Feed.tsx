import type { Entry, CategoryId } from '@/types'
import { EntryCard } from './EntryCard'
import { formatDateLabel, getDateKey } from '@/utils/date'

interface FeedProps {
  entries: Entry[]
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string, category: CategoryId | null, tags: string[]) => void
  onTagClick: (tag: string) => void
}

export function Feed({ entries, onDelete, onUpdate, onTagClick }: FeedProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const groups: { dateKey: string; label: string; items: Entry[] }[] = []
  sorted.forEach(entry => {
    const key = getDateKey(entry.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.dateKey === key) last.items.push(entry)
    else groups.push({ dateKey: key, label: formatDateLabel(entry.createdAt), items: [entry] })
  })

  if (entries.length === 0) return (
    <div className="text-center py-16">
      <div className="font-serif text-5xl italic text-paper-border leading-none mb-4 tracking-[-2px]">∿</div>
      <p className="font-body text-sm font-light text-ink-faint italic leading-[1.7]">
        결과가 없어요.<br />다른 검색어나 필터를 시도해보세요.
      </p>
    </div>
  )

  return (
    <div>
      {groups.map(group => (
        <div key={group.dateKey}>
          <div className="flex items-center gap-3 py-5">
            <div className="flex-1 h-px bg-paper-border" />
            <span className="font-sans text-[10px] font-normal text-ink-faint tracking-[0.12em] uppercase whitespace-nowrap">{group.label}</span>
            <div className="flex-1 h-px bg-paper-border" />
          </div>
          {group.items.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDelete={onDelete} onUpdate={onUpdate} onTagClick={onTagClick} />
          ))}
        </div>
      ))}
    </div>
  )
}
