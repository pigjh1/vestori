import { useState } from 'react'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { Composer } from '@/components/Composer'
import { SearchBar } from '@/components/SearchBar'
import { Feed } from '@/components/Feed'
import { CalendarMonth } from '@/components/CalendarMonth'
import { CalendarTimeline } from '@/components/CalendarTimeline'
import { MoodPage } from '@/pages/MoodPage'
import { RoutinePage } from '@/pages/RoutinePage'
import { DietPage } from '@/pages/DietPage'
import { RetrospectPage } from '@/pages/RetrospectPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useEntries } from '@/hooks/useEntries'
import { useFilter, type PageMode } from '@/hooks/useFilter'
import { useThreads } from '@/hooks/useThreads'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useDesign } from '@/hooks/useDesign'
import { getDateKey } from '@/utils/date'

type AnyPage = PageMode

export function App() {
  const { dark, toggle: toggleDark } = useDarkMode()
  useDesign()

  const { entries, addEntry, updateEntry, deleteEntry, allTags } = useEntries()
  const { addPost, deletePost, getByEntry } = useThreads()
  const {
    query, setQuery, activeTag, toggleTag, activeCategory, toggleCategory,
    clearFilters, hasActiveFilter, setPageMode, recordView, setRecordView, filtered,
  } = useFilter(entries)

  const [anyPage, setAnyPage] = useState<AnyPage>('records')
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const handleSelect = (p: AnyPage) => {
    setAnyPage(p)
    setPageMode(p)
    setSelectedDateKey(null)
  }

  const calendarFiltered = selectedDateKey
    ? filtered.filter(e => getDateKey(e.createdAt) === selectedDateKey)
    : filtered

  const DarkToggle = () => (
    <button onClick={toggleDark}
      className="w-8 h-8 flex items-center justify-center rounded-md text-ink-faint hover:text-ink transition-colors cursor-pointer">
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.9 2.9l1.1 1.1M12 12l1.1 1.1M2.9 13.1l1.1-1.1M12 4l1.1-1.1"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5 5.5 5.5 0 1 0 13.5 9.5z"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  )

  const feedProps = {
    getPosts: getByEntry,
    onDelete: deleteEntry,
    onUpdate: updateEntry,
    onTagClick: toggleTag,
    onAddPost: addPost,
    onDeletePost: deletePost,
  }

  return (
    <div className="min-h-screen bg-paper transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` }} />

      <div className="max-w-[680px] mx-auto px-4 sm:px-8 pb-24">
        <div className="flex items-center justify-between pt-4 sm:hidden">
          <span className="text-xl italic text-ink">Vestori</span>
          <DarkToggle />
        </div>

        <Header pageMode={anyPage} recordView={recordView}
          onRecordViewChange={v => { setRecordView(v); setSelectedDateKey(null) }} />

        {anyPage === 'records' && (
          <>
            <Composer onSubmit={(title, text, category, meta, tags, ids, loc, time) => addEntry(title, text, category, meta, tags, ids, loc, time)} />
            <SearchBar
              query={query} onQueryChange={setQuery}
              activeTag={activeTag} onTagClick={toggleTag}
              activeCategory={activeCategory} onCategoryClick={toggleCategory}
              allTags={allTags} hasActiveFilter={hasActiveFilter} onClear={clearFilters}
            />
            {recordView === 'feed' && <Feed entries={filtered} {...feedProps} />}
            {recordView === 'calendar' && (
              <>
                <CalendarMonth entries={filtered}
                  onDayClick={d => setSelectedDateKey(prev => prev === d ? null : d)}
                  selectedDateKey={selectedDateKey} />
                <Feed entries={calendarFiltered} {...feedProps} />
              </>
            )}
            {recordView === 'timeline' && <CalendarTimeline entries={filtered} {...feedProps} />}
          </>
        )}

        {anyPage === 'mood'       && <MoodPage />}
        {anyPage === 'routine'    && <RoutinePage />}
        {anyPage === 'diet'       && <DietPage />}
        {anyPage === 'retrospect' && <RetrospectPage />}
        {anyPage === 'settings'   && <SettingsPage entries={entries} />}
      </div>

      <BottomNav pageMode={anyPage} onSelect={handleSelect} />
    </div>
  )
}
