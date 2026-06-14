import { IconMapPin, IconExternalLink, IconChevronDown, IconChevronUp } from './Icon'
import { useState, useMemo } from 'react'
import type { Entry } from '@/types'
import { formatDateFull, formatTime } from '@/utils/date'

interface PlaceGroup {
  location: string
  entries: Entry[]
}

export function PlacesView({ entries }: { entries: Entry[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const places = useMemo<PlaceGroup[]>(() => {
    const map: Record<string, Entry[]> = {}
    entries.forEach(e => {
      const loc = e.location?.trim()
      if (!loc) return
      if (!map[loc]) map[loc] = []
      map[loc].push(e)
    })
    return Object.entries(map)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([location, ents]) => ({ location, entries: ents.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }))
  }, [entries])

  const filtered = search.trim()
    ? places.filter(p => p.location.toLowerCase().includes(search.toLowerCase()))
    : places

  if (places.length === 0) return (
    <div className="py-12 text-center text-sm text-ink-faint">위치 기록이 없어요</div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm text-ink-faint">{places.length}곳 방문</p>
        <div className="flex-1" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="장소 검색..."
          className="border border-paper-border rounded-sm px-3 py-1.5 text-sm outline-none focus:border-ink/30 w-36" />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(place => {
          const isOpen = selected === place.location
          return (
            <div key={place.location}
              className="bg-paper-card border border-paper-border rounded-sm overflow-hidden">
              {/* 장소 헤더 */}
              <button className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-paper-warm transition-colors"
                onClick={() => setSelected(isOpen ? null : place.location)}>
                <IconMapPin size={15} className="flex-shrink-0" />
                <span className="text-base text-ink flex-1 text-left">{place.location}</span>
                <span className="text-sm text-ink-faint">{place.entries.length}개</span>
                <a href={`https://maps.google.com/maps?q=${encodeURIComponent(place.location)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-sm text-ink-faint hover:text-ink transition-colors px-1"><IconExternalLink size={13} /></a>
                <span className="text-ink-faint flex-shrink-0">{isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</span>
              </button>

              {/* 기록 목록 */}
              {isOpen && (
                <div className="border-t border-paper-border divide-y divide-paper-border">
                  {place.entries.map(e => (
                    <div key={e.id} className="px-4 py-3">
                      <p className="text-sm text-ink-faint mb-0.5">
                        {formatDateFull(e.createdAt.split('T')[0])} · {formatTime(e.createdAt)}
                      </p>
                      {e.title && <p className="text-sm text-ink-muted">{e.title}</p>}
                      <p className="text-sm text-ink line-clamp-2">{e.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
