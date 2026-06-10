import type { CategoryId } from '@/types'
import { CATEGORIES } from '@/types'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  activeTag: string | null
  onTagClick: (tag: string) => void
  activeCategory: CategoryId | null
  onCategoryClick: (c: CategoryId) => void
  allTags: string[]
  hasActiveFilter: boolean
  onClear: () => void
}

export function SearchBar({ query, onQueryChange, onTagClick, onCategoryClick, allTags, hasActiveFilter, onClear }: SearchBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-lg pointer-events-none leading-none">⌕</span>
        <input type="text" value={query} onChange={e => onQueryChange(e.target.value)}
          placeholder="기록 검색..."
          className="w-full text-ink bg-paper-card border border-paper-border rounded-sm pl-7 pr-8 py-2 outline-none focus:border-ink/30 transition-colors placeholder:text-ink-faint" />
        {query && (
          <button onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-sm cursor-pointer bg-none border-none">×</button>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} onClick={() => onCategoryClick(id)}
            className={`btn-sm btn-on`}>
            {label}
          </button>
        ))}
        {allTags.slice(0, 6).map(tag => (
          <button key={tag} onClick={() => onTagClick(tag)}
            className={`btn-sm btn-on`}>
            #{tag}
          </button>
        ))}
        {hasActiveFilter && (
          <button onClick={onClear} className="text-xs text-ink-faint hover:text-accent border-none bg-none p-0 cursor-pointer transition-colors ml-1">
            초기화
          </button>
        )}
      </div>
    </div>
  )
}
