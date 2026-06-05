import { useState } from 'react'
import { format } from 'date-fns'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Composer } from '@/components/Composer'
import { SearchBar } from '@/components/SearchBar'
import { Feed } from '@/components/Feed'
import { CalendarMonth } from '@/components/CalendarMonth'
import { CalendarTimeline } from '@/components/CalendarTimeline'
import { Stats } from '@/components/Stats'
import { MoodPage } from '@/pages/MoodPage'
import { RoutinePage } from '@/pages/RoutinePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useEntries } from '@/hooks/useEntries'
import { useFilter, type PageMode } from '@/hooks/useFilter'
import { useDarkMode } from '@/hooks/useDarkMode'

type AnyPage = PageMode | 'stats'

export function App() {
  const { dark, toggle: toggleDark } = useDarkMode()
  const { entries, addEntry, updateEntry, deleteEntry, allTags } = useEntries()
  const {
    query, setQuery, activeTag, toggleTag, activeCategory, toggleCategory,
    clearFilters, hasActiveFilter, setPageMode, recordView, setRecordView, filtered,
  } = useFilter(entries)
  const [anyPage, setAnyPage] = useState<AnyPage>('records')
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const handleSelect = (p: AnyPage) => {
    setAnyPage(p)
    if (p !== 'stats') setPageMode(p as PageMode)
    setSelectedDateKey(null)
  }

  const calendarFiltered = selectedDateKey
    ? filtered.filter(e => format(new Date(e.createdAt), 'yyyy-MM-dd') === selectedDateKey)
    : filtered

  return (
    <div className="min-h-screen bg-paper transition-colors duration-300 flex">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-40"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")` }} />

      <Sidebar pageMode={anyPage} onSelect={handleSelect} dark={dark} onToggleDark={toggleDark} />

      <main className="flex-1 pl-16">
        <div className="max-w-[680px] mx-auto px-8 pb-20">
          <Header
            pageMode={anyPage}
            recordView={recordView}
            onRecordViewChange={v => { setRecordView(v); setSelectedDateKey(null) }}
          />

          {anyPage === 'records' && (
            <>
              <Composer onSubmit={addEntry} />
              <SearchBar
                query={query} onQueryChange={setQuery}
                activeTag={activeTag} onTagClick={toggleTag}
                activeCategory={activeCategory} onCategoryClick={toggleCategory}
                allTags={allTags} hasActiveFilter={hasActiveFilter} onClear={clearFilters}
              />
              {recordView === 'feed' && (
                <Feed entries={filtered} onDelete={deleteEntry} onUpdate={updateEntry} onTagClick={toggleTag} />
              )}
              {recordView === 'calendar' && (
                <>
                  <CalendarMonth entries={filtered}
                    onDayClick={d => setSelectedDateKey(prev => prev === d ? null : d)}
                    selectedDateKey={selectedDateKey} />
                  <Feed entries={calendarFiltered} onDelete={deleteEntry} onUpdate={updateEntry} onTagClick={toggleTag} />
                </>
              )}
              {recordView === 'timeline' && (
                <CalendarTimeline entries={filtered} onDelete={deleteEntry} onUpdate={updateEntry} onTagClick={toggleTag} />
              )}
            </>
          )}

          {anyPage === 'mood'     && <MoodPage />}
          {anyPage === 'routine'  && <RoutinePage />}
          {anyPage === 'stats'    && <Stats entries={entries} />}
          {anyPage === 'settings' && <SettingsPage entries={entries} />}
        </div>
      </main>
    </div>
  )
}
