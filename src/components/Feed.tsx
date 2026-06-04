import type { Entry } from '@/types'
import { EntryCard } from './EntryCard'
import { formatDateLabel, getDateKey } from '@/utils/date'

interface FeedProps {
  entries: Entry[]
  onLike: (id: string) => void
  onDelete: (id: string) => void
}

export function Feed({ entries, onLike, onDelete }: FeedProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Group by date
  const groups: { dateKey: string; label: string; items: Entry[] }[] = []
  sorted.forEach(entry => {
    const key = getDateKey(entry.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.dateKey === key) {
      last.items.push(entry)
    } else {
      groups.push({
        dateKey: key,
        label: formatDateLabel(entry.createdAt),
        items: [entry],
      })
    }
  })

  return (
    <div>
      {/* Feed header */}
      <div className="flex items-baseline gap-2.5 mb-6">
        <span className="font-serif text-[13px] italic text-ink-muted tracking-wide">
          흔적들
        </span>
        <div className="flex-1 h-px bg-paper-border" />
        <span className="font-sans text-[11px] font-light text-ink-faint">
          {entries.length}개의 기록
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="font-serif text-5xl italic text-paper-border leading-none mb-4 tracking-[-2px]">
            ∿
          </div>
          <p className="font-body text-sm font-light text-ink-faint italic leading-[1.7]">
            아직 남겨진 흔적이 없어요.
            <br />
            첫 번째 이야기를 시작해 보세요.
          </p>
        </div>
      ) : (
        groups.map(group => (
          <div key={group.dateKey}>
            {/* Date divider */}
            <div className="flex items-center gap-3 py-5">
              <div className="flex-1 h-px bg-paper-border" />
              <span className="font-sans text-[10px] font-normal text-ink-faint tracking-[0.12em] uppercase whitespace-nowrap">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-paper-border" />
            </div>

            {group.items.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onLike={onLike}
                onDelete={onDelete}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
