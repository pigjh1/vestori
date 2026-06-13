import type { CategoryId } from '@/types'
import { CATEGORIES } from '@/types'
import { IconSearch, IconX } from './Icon'

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

export function SearchBar({ query, onQueryChange, onTagClick, onCategoryClick, activeCategory, activeTag, allTags, hasActiveFilter, onClear }: SearchBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* 카테고리 탭 */}
      <div className="tab-bar">
        <button
          onClick={() => activeCategory && onCategoryClick(activeCategory)}
          className={`tab flex-1 text-center ${!activeCategory ? 'tab-on' : 'tab-off'}`}>
          전체
        </button>
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} onClick={() => onCategoryClick(id)}
            className={`tab flex-1 text-center ${activeCategory === id ? 'tab-on' : 'tab-off'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          <IconSearch size={15} />
        </span>
        <input type="text" value={query} onChange={e => onQueryChange(e.target.value)}
          placeholder="기록 검색..."
          className="w-full text-ink bg-paper-card border border-paper-border rounded-sm pl-8 pr-8 py-2 outline-none focus:border-ink/30 transition-colors placeholder:text-ink-faint" />
        {query && (
          <button onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer bg-none border-none p-0">
            <IconX size={14} />
          </button>
        )}
      </div>

      {/* 태그 필터 + 초기화 */}
      {(allTags.length > 0 || hasActiveFilter) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {allTags.slice(0, 8).map(tag => (
            <button key={tag} onClick={() => onTagClick(tag)}
              className={`text-sm px-2 py-0.5 rounded-full border transition-colors cursor-pointer
                ${activeTag === tag
                  ? 'border-ink/30 text-ink bg-ink/8'
                  : 'border-paper-border text-ink-faint hover:text-ink-muted hover:border-ink/20'}`}>
              #{tag}
            </button>
          ))}
          {hasActiveFilter && (
            <button onClick={onClear} className="text-sm text-ink-faint hover:text-ink-muted border-none bg-none p-0 cursor-pointer transition-colors ml-1">
              초기화
            </button>
          )}
        </div>
      )}
    </div>
  )
}
