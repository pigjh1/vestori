import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { todayKey, getDateKey, subDays } from '@/utils/date'

export interface Habit {
  id: string
  name: string
  createdAt: string
  streak: number
}

type CheckMap = Record<string, Record<string, boolean>>

const HABITS_KEY = 'vestori:habits'
const CHECKS_KEY = 'vestori:checks'

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback }
  catch { return fallback }
}

function calcStreak(habitId: string, checks: CheckMap): number {
  let streak = 0
  let cursor = new Date()
  if (!checks[todayKey()]?.[habitId]) cursor = subDays(cursor, 1)
  for (let i = 0; i < 365; i++) {
    const key = getDateKey(cursor.toISOString())
    if (checks[key]?.[habitId]) { streak++; cursor = subDays(cursor, 1) }
    else break
  }
  return streak
}

const DEFAULT_HABITS: Habit[] = [
  '물 마시기', '운동', '일기쓰기', '손톱관리', '영양제', '책읽기'
].map(name => ({ id: uuidv4(), name, createdAt: new Date().toISOString(), streak: 0 }))

export function useRoutine() {
  const [habits, setHabits] = useState<Habit[]>(() => load(HABITS_KEY, DEFAULT_HABITS))
  const [checks, setChecks] = useState<CheckMap>(() => load(CHECKS_KEY, {}))

  useEffect(() => { try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)) } catch {} }, [habits])
  useEffect(() => { try { localStorage.setItem(CHECKS_KEY, JSON.stringify(checks)) } catch {} }, [checks])

  const habitsWithStreak = habits.map(h => ({ ...h, streak: calcStreak(h.id, checks) }))

  const addHabit = useCallback((name: string) => {
    setHabits(prev => [...prev, { id: uuidv4(), name, createdAt: new Date().toISOString(), streak: 0 }])
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    setChecks(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(date => {
        if (next[date][id] !== undefined) { const { [id]: _, ...rest } = next[date]; next[date] = rest }
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
