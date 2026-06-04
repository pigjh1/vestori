import { useState, useEffect, useCallback } from 'react'
import type { MoodRecord, MoodScore } from '@/types'
import { format } from 'date-fns'

const STORAGE_KEY = 'vestori:moods'

function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

function load(): Record<string, MoodRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function save(records: Record<string, MoodRecord>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) } catch {}
}

export function useMoodRecords() {
  const [records, setRecords] = useState<Record<string, MoodRecord>>(load)

  useEffect(() => { save(records) }, [records])

  const setMood = useCallback((date: string, score: MoodScore, note: string) => {
    setRecords(prev => ({ ...prev, [date]: { date, score, note } }))
  }, [])

  const deleteMood = useCallback((date: string) => {
    setRecords(prev => { const next = { ...prev }; delete next[date]; return next })
  }, [])

  const todayRecord = records[today()] ?? null

  return { records, setMood, deleteMood, todayRecord, today: today() }
}
