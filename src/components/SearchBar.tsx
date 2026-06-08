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

export function SearchBar({ query, onQueryChange, activeTag, onTagClick, activeCategory, onCategoryClick, allTags, hasActiveFilter, onClear }: SearchBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[18px] pointer-events-none leading-none">⌕</span>
        <input type="text" value={query} onChange={e => onQueryChange(e.target.value)}
          placeholder="기록 검색..."
          className="w-full font-sans text-ink bg-white border border-paper-border rounded-sm pl-7 pr-8 py-2 outline-none focus:border-accent-light transition-colors placeholder:text-ink-faint" />
        {query && (
          <button onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-[14px] cursor-pointer bg-none border-none">×</button>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} onClick={() => onCategoryClick(id)}
            className={`font-sans text-[12px] px-2.5 py-1 rounded-sm border transition-all cursor-pointer
              ${activeCategory === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
            {label}
          </button>
        ))}
        {allTags.slice(0, 6).map(tag => (
          <button key={tag} onClick={() => onTagClick(tag)}
            className={`font-sans text-[12px] px-2.5 py-1 rounded-sm border transition-all cursor-pointer
              ${activeTag === tag ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
            #{tag}
          </button>
        ))}
        {hasActiveFilter && (
          <button onClick={onClear} className="font-sans text-[12px] text-ink-faint hover:text-accent border-none bg-none p-0 cursor-pointer transition-colors ml-1">
            초기화
          </button>
        )}
      </div>
    </div>
  )
}
