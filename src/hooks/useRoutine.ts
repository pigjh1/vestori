import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format, subDays } from 'date-fns'

export interface Habit {
  id: string
  name: string
  createdAt: string
  streak: number       // 연속 달성일 (오늘 기준 계산)
}

// checks: { 'yyyy-MM-dd': { habitId: boolean } }
type CheckMap = Record<string, Record<string, boolean>>

const HABITS_KEY = 'vestori:habits'
const CHECKS_KEY = 'vestori:checks'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function calcStreak(habitId: string, checks: CheckMap): number {
  let streak = 0
  let cursor = new Date()
  // 오늘 체크 안 됐으면 어제부터 확인
  const todayKey = format(cursor, 'yyyy-MM-dd')
  if (!checks[todayKey]?.[habitId]) cursor = subDays(cursor, 1)

  for (let i = 0; i < 365; i++) {
    const key = format(cursor, 'yyyy-MM-dd')
    if (checks[key]?.[habitId]) { streak++; cursor = subDays(cursor, 1) }
    else break
  }
  return streak
}

export function useRoutine() {
  const [habits, setHabits] = useState<Habit[]>(() => load(HABITS_KEY, []))
  const [checks, setChecks] = useState<CheckMap>(() => load(CHECKS_KEY, {}))

  useEffect(() => { save(HABITS_KEY, habits) }, [habits])
  useEffect(() => { save(CHECKS_KEY, checks)  }, [checks])

  // 스트릭 갱신
  const habitsWithStreak = habits.map(h => ({ ...h, streak: calcStreak(h.id, checks) }))

  const addHabit = useCallback((name: string) => {
    setHabits(prev => [...prev, { id: uuidv4(), name, createdAt: new Date().toISOString(), streak: 0 }])
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    // 해당 habit의 체크 기록 정리
    setChecks(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(date => {
        if (next[date][id] !== undefined) {
          const { [id]: _, ...rest } = next[date]
          next[date] = rest
        }
      })
      return next
    })
  }, [])

  const toggle = useCallback((date: string, habitId: string) => {
    setChecks(prev => {
      const day = prev[date] ?? {}
      return { ...prev, [date]: { ...day, [habitId]: !day[habitId] } }
    })
  }, [])

  const reorder = useCallback((fromIdx: number, toIdx: number) => {
    setHabits(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  return { habits: habitsWithStreak, checks, addHabit, deleteHabit, toggle, reorder }
}
