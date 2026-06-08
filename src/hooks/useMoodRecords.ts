import { useState, useEffect } from 'react'
import type { MoodScore, MoodEntry } from '@/types'
import { getDateKey } from '@/utils/date'

const STORAGE_KEY = 'vestori:moods'

function loadRecords(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // 구버전 데이터(객체 형태)가 있으면 초기화
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
    return parsed as MoodEntry[]
  } catch {
    return []
  }
}

export function useMoodRecords() {
  const [entries, setEntries] = useState<MoodEntry[]>(() => loadRecords())
  const today = getDateKey(new Date().toISOString())

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch {}
  }, [entries])

  // 날짜별 기분 기록 (여러 개)
  const recordsByDate = entries.reduce((acc, entry) => {
    const date = entry.dateTime.split(' ')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {} as Record<string, MoodEntry[]>)

  // 날짜별 평균값
  const avgByDate = Object.entries(recordsByDate).reduce((acc, [date, recs]) => {
    const avg = recs.reduce((s, r) => s + r.score, 0) / recs.length
    acc[date] = avg
    return acc
  }, {} as Record<string, number>)

  // 오늘 기분
  const todayEntries = recordsByDate[today] || []
  const todayAvg = todayEntries.length > 0
    ? Math.round((todayEntries.reduce((s, e) => s + e.score, 0) / todayEntries.length) * 10) / 10
    : null

  return {
    entries,
    recordsByDate,
    avgByDate,
    todayEntries,
    todayAvg,
    today,
    setMood: (dateTime: string, score: MoodScore) => {
      setEntries([...entries, { dateTime, score }])
    },
    deleteMood: (dateTime: string) => {
      setEntries(entries.filter(e => e.dateTime !== dateTime))
    },
    deleteDay: (date: string) => {
      setEntries(entries.filter(e => !e.dateTime.startsWith(date)))
    },
  }
}
