import type { Entry, CategoryId, CategoryMeta, ThreadPost } from '@/types'
import { EntryCard } from './EntryCard'
import { formatDateLabel, getDateKey } from '@/utils/date'

interface FeedProps {
  entries: Entry[]
  getPosts: (entryId: string) => ThreadPost[]
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string, text: string, category: CategoryId | null, categoryMeta: CategoryMeta, tags: string[], imageIds: string[], location: string) => void
  onTagClick: (tag: string) => void
  onAddPost: (entryId: string, text: string, imageIds: string[]) => void
  onDeletePost: (id: string) => void
}

export function Feed({ entries, getPosts, onDelete, onUpdate, onTagClick, onAddPost, onDeletePost }: FeedProps) {
  const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const groups: { dateKey: string; label: string; items: Entry[] }[] = []
  sorted.forEach(entry => {
    const key = getDateKey(entry.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.dateKey === key) last.items.push(entry)
    else groups.push({ dateKey: key, label: formatDateLabel(entry.createdAt), items: [entry] })
  })

  if (entries.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl italic text-paper-border leading-none mb-4 tracking-[-2px]">∿</div>
      <p className="text-sm font-light text-ink-faint italic leading-[1.7]">결과가 없어요.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <div key={group.dateKey}>
          {/* 날짜 구분선 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-paper-border" />
            <span className="text-xs text-ink-faint tracking-wide uppercase whitespace-nowrap">{group.label}</span>
            <div className="flex-1 h-px bg-paper-border" />
          </div>
          {/* 카드 목록 */}
          <div className="flex flex-col gap-3">
            {group.items.map(entry => (
              <EntryCard key={entry.id} entry={entry} posts={getPosts(entry.id)}
                onDelete={onDelete} onUpdate={onUpdate} onTagClick={onTagClick}
                onAddPost={onAddPost} onDeletePost={onDeletePost} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
