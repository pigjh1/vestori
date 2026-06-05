import { useState, useMemo } from 'react'
import type { Entry, CategoryId } from '@/types'

export type PageMode = 'records' | 'mood' | 'routine' | 'settings'
export type RecordView = 'feed' | 'calendar' | 'timeline'

export function useFilter(entries: Entry[]) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null)
  const [pageMode, setPageMode] = useState<PageMode>('records')
  const [recordView, setRecordView] = useState<RecordView>('feed')

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const q = query.trim().toLowerCase()
      if (q && !e.text.toLowerCase().includes(q) && !e.tags.some(t => t.toLowerCase().includes(q))) return false
      if (activeTag && !e.tags.includes(activeTag)) return false
      if (activeCategory && e.category !== activeCategory) return false
      return true
    })
  }, [entries, query, activeTag, activeCategory])

  const toggleTag = (tag: string) => setActiveTag(prev => prev === tag ? null : tag)
  const toggleCategory = (cat: CategoryId) => setActiveCategory(prev => prev === cat ? null : cat)
  const clearFilters = () => { setQuery(''); setActiveTag(null); setActiveCategory(null) }
  const hasActiveFilter = !!query || !!activeTag || !!activeCategory

  return {
    query, setQuery, activeTag, toggleTag, activeCategory, toggleCategory,
    clearFilters, hasActiveFilter, pageMode, setPageMode, recordView, setRecordView, filtered,
  }
}
