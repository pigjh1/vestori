import { useState, useEffect, useCallback } from 'react'
import type { MoodRecord, MoodScore } from '@/types'
import { todayKey } from '@/utils/date'

const STORAGE_KEY = 'vestori:moods'

function load(): Record<string, MoodRecord> {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {} }
  catch { return {} }
}

export function useMoodRecords() {
  const [records, setRecords] = useState<Record<string, MoodRecord>>(load)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) } catch {}
  }, [records])

  const setMood = useCallback((date: string, score: MoodScore, note: string) => {
    setRecords(prev => ({ ...prev, [date]: { date, score, note } }))
  }, [])

  const deleteMood = useCallback((date: string) => {
    setRecords(prev => { const next = { ...prev }; delete next[date]; return next })
  }, [])

  const today = todayKey()
  const todayRecord = records[today] ?? null

  return { records, setMood, deleteMood, todayRecord, today }
}
