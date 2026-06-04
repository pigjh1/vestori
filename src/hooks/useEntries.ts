import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Entry, Mood } from '@/types'

const STORAGE_KEY = 'vestori:entries'

const SAMPLE_ENTRIES: Entry[] = [
  {
    id: uuidv4(),
    text: '오늘 오랜만에 산책을 했다. 바람이 조금 차가웠지만, 그 안에서 봄의 냄새가 났다. 계절이 바뀌는 순간을 몸으로 느끼는 건 늘 특별하다.',
    mood: '✿',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    liked: false,
  },
  {
    id: uuidv4(),
    text: '오래된 사진첩을 꺼내봤다. 기억이란 게 얼마나 얇은지. 사진이 없었다면 그 시간들을 어떻게 붙잡았을까.',
    mood: '♡',
    createdAt: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(),
    liked: false,
  },
  {
    id: uuidv4(),
    text: '카페에서 두 시간을 보냈다. 창밖으로 사람들이 지나갔다. 각자의 이야기를 가지고 걸어가는 뒷모습들.',
    mood: '◎',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    liked: false,
  },
]

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SAMPLE_ENTRIES
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
    return SAMPLE_ENTRIES
  } catch {
    return SAMPLE_ENTRIES
  }
}

function saveEntries(entries: Entry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // storage full or unavailable
  }
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(loadEntries)

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const addEntry = useCallback((text: string, mood: Mood) => {
    const entry: Entry = {
      id: uuidv4(),
      text,
      mood,
      createdAt: new Date().toISOString(),
      liked: false,
    }
    setEntries(prev => [entry, ...prev])
  }, [])

  const toggleLike = useCallback((id: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, liked: !e.liked } : e))
    )
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  return { entries, addEntry, toggleLike, deleteEntry }
}
