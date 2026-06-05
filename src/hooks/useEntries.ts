import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Entry, CategoryId } from '@/types'
import { deleteImages } from '@/lib/imageDB'

const STORAGE_KEY = 'vestori:entries'

const SAMPLE_ENTRIES: Entry[] = [
  {
    id: uuidv4(),
    text: '오늘 오랜만에 산책을 했다. 바람이 조금 차가웠지만, 그 안에서 봄의 냄새가 났다.',
    category: 'place',
    tags: ['봄', '산책'],
    imageIds: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: uuidv4(),
    text: '오래된 사진첩을 꺼내봤다. 기억이란 게 얼마나 얇은지.',
    category: null,
    tags: ['기억', '회상'],
    imageIds: [],
    createdAt: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(),
  },
  {
    id: uuidv4(),
    text: '카페에서 두 시간을 보냈다. 창밖으로 사람들이 지나갔다.',
    category: 'food',
    tags: ['카페', '일상'],
    imageIds: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SAMPLE_ENTRIES
    const parsed = JSON.parse(raw) as Entry[]
    if (Array.isArray(parsed) && parsed.length > 0)
      return parsed.map(e => ({ ...e, tags: e.tags ?? [], imageIds: e.imageIds ?? [] }))
    return SAMPLE_ENTRIES
  } catch { return SAMPLE_ENTRIES }
}

function saveEntries(entries: Entry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch {}
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(loadEntries)
  useEffect(() => { saveEntries(entries) }, [entries])

  const addEntry = useCallback((
    text: string,
    category: CategoryId | null,
    tags: string[],
    imageIds: string[],
    createdAt: string,
  ) => {
    setEntries(prev => [{ id: uuidv4(), text, category, tags, imageIds, createdAt }, ...prev])
  }, [])

  const updateEntry = useCallback((
    id: string,
    text: string,
    category: CategoryId | null,
    tags: string[],
    imageIds: string[],
  ) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, text, category, tags, imageIds } : e))
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const entry = prev.find(e => e.id === id)
      if (entry?.imageIds.length) deleteImages(entry.imageIds)
      return prev.filter(e => e.id !== id)
    })
  }, [])

  const allTags = Array.from(
    entries.flatMap(e => e.tags).reduce((map, tag) => {
      map.set(tag, (map.get(tag) ?? 0) + 1); return map
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).map(([tag]) => tag)

  return { entries, addEntry, updateEntry, deleteEntry, allTags }
}
