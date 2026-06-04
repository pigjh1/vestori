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

export function SearchBar({
  query, onQueryChange,
  activeTag, onTagClick,
  activeCategory, onCategoryClick,
  allTags, hasActiveFilter, onClear,
}: SearchBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      {/* 검색 입력 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-[12px] pointer-events-none">⌕</span>
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="기록 검색..."
          className="w-full font-sans text-[13px] font-light text-ink bg-white border border-paper-border rounded-sm pl-7 pr-3 py-2 outline-none focus:border-accent-light transition-colors placeholder:text-ink-faint"
        />
        {query && (
          <button onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-[12px] cursor-pointer bg-none border-none">×</button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} onClick={() => onCategoryClick(id)}
            className={`font-sans text-[11px] px-2.5 py-1 rounded-sm border transition-all duration-150 cursor-pointer
              ${activeCategory === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
            {label}
          </button>
        ))}

        {/* 태그 필터 */}
        {allTags.slice(0, 8).map(tag => (
          <button key={tag} onClick={() => onTagClick(tag)}
            className={`font-sans text-[11px] px-2.5 py-1 rounded-sm border transition-all duration-150 cursor-pointer
              ${activeTag === tag ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
            #{tag}
          </button>
        ))}

        {hasActiveFilter && (
          <button onClick={onClear}
            className="font-sans text-[11px] text-ink-faint hover:text-accent border-none bg-none p-0 cursor-pointer transition-colors ml-1">
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}
