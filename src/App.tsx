import { useState } from 'react'
import { format } from 'date-fns'
import { Header } from '@/components/Header'
import { Composer } from '@/components/Composer'
import { SearchBar } from '@/components/SearchBar'
import { Feed } from '@/components/Feed'
import { CalendarMonth } from '@/components/CalendarMonth'
import { CalendarTimeline } from '@/components/CalendarTimeline'
import { Stats } from '@/components/Stats'
import { MoodPage } from '@/pages/MoodPage'
import { useEntries } from '@/hooks/useEntries'
import { useFilter, type ViewMode } from '@/hooks/useFilter'
import { useDarkMode } from '@/hooks/useDarkMode'

const VIEW_LABELS: { mode: ViewMode; label: string }[] = [
  { mode: 'feed',              label: '피드' },
  { mode: 'calendar-month',    label: '달력' },
  { mode: 'calendar-timeline', label: '타임라인' },
  { mode: 'stats',             label: '통계' },
  { mode: 'mood',              label: '기분' },
]

const HIDE_COMPOSER: ViewMode[] = ['stats', 'mood']
const HIDE_SEARCH: ViewMode[] = ['stats', 'mood']

export function App() {
  const { dark, toggle: toggleDark } = useDarkMode()
  const { entries, addEntry, updateEntry, deleteEntry, allTags } = useEntries()
  const { query, setQuery, activeTag, toggleTag, activeCategory, toggleCategory,
    clearFilters, hasActiveFilter, viewMode, setViewMode, filtered } = useFilter(entries)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const handleDayClick = (dateKey: string) =>
    setSelectedDateKey(prev => prev === dateKey ? null : dateKey)

  const calendarFiltered = selectedDateKey
    ? filtered.filter(e => format(new Date(e.createdAt), 'yyyy-MM-dd') === selectedDateKey)
    : filtered

  return (
    <div className="min-h-screen bg-paper relative transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-40"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")` }} />

      <div className="max-w-[680px] mx-auto px-6 pb-20">
        <Header dark={dark} onToggleDark={toggleDark} />

        {!HIDE_COMPOSER.includes(viewMode) && <Composer onSubmit={addEntry} />}

        {/* 뷰 탭 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 flex-wrap">
            {VIEW_LABELS.map(({ mode, label }) => (
              <button key={mode} onClick={() => { setViewMode(mode); setSelectedDateKey(null) }}
                className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all duration-150 cursor-pointer
                  ${viewMode === mode
                    ? 'border-accent bg-accent-pale text-accent'
                    : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
                {label}
              </button>
            ))}
          </div>
          <span className="font-sans text-[11px] font-light text-ink-faint">{entries.length}개의 기록</span>
        </div>

        {!HIDE_SEARCH.includes(viewMode) && (
          <SearchBar
            query={query} onQueryChange={setQuery}
            activeTag={activeTag} onTagClick={toggleTag}
            activeCategory={activeCategory} onCategoryClick={toggleCategory}
            allTags={allTags} hasActiveFilter={hasActiveFilter} onClear={clearFilters}
          />
        )}

        {viewMode === 'feed' && (
          <Feed entries={filtered} onDelete={deleteEntry} onUpdate={updateEntry} onTagClick={toggleTag} />
        )}
        {viewMode === 'calendar-month' && (
          <>
            <CalendarMonth entries={filtered} onDayClick={handleDayClick} selectedDateKey={selectedDateKey} />
            <Feed entries={calendarFiltered} onDelete={deleteEntry} onUpdate={updateEntry} onTagClick={toggleTag} />
          </>
        )}
        {viewMode === 'calendar-timeline' && (
          <CalendarTimeline entries={filtered} onDelete={deleteEntry} onUpdate={updateEntry} onTagClick={toggleTag} />
        )}
        {viewMode === 'stats' && <Stats entries={entries} />}
        {viewMode === 'mood' && <MoodPage />}
      </div>
    </div>
  )
}
