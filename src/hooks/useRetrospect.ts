import { useState, useEffect } from 'react'

const STORAGE_KEY = 'vestori:retrospects'

export interface WeeklyRetro {
  type: 'weekly'
  weekKey: string
  wins: string          // ✅ 이번 주 잘한 것
  learnings: string     // 📚 배운 것
  challenges: string    // 😤 힘들었던 것
  next_focus: string    // 🎯 다음 주 집중할 것
  energy: string        // ⚡ 에너지/컨디션
  updatedAt: string
}

export interface MonthlyRetro {
  type: 'monthly'
  monthKey: string
  achievements_work: string
  achievements_personal: string
  improvements: string
  ideas: string
  actions: string
  others: string
  updatedAt: string
}

export type Retro = WeeklyRetro | MonthlyRetro

function load(): Record<string, Retro> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function useRetrospect() {
  const [retros, setRetros] = useState<Record<string, Retro>>(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(retros)) } catch {}
  }, [retros])

  return {
    retros,
    saveWeekly: (weekKey: string, data: Omit<WeeklyRetro, 'type' | 'weekKey' | 'updatedAt'>) => {
      setRetros(prev => ({
        ...prev,
        [weekKey]: { type: 'weekly', weekKey, ...data, updatedAt: new Date().toISOString() }
      }))
    },
    saveMonthly: (monthKey: string, data: Omit<MonthlyRetro, 'type' | 'monthKey' | 'updatedAt'>) => {
      setRetros(prev => ({
        ...prev,
        [monthKey]: { type: 'monthly', monthKey, ...data, updatedAt: new Date().toISOString() }
      }))
    },
    deleteAll: () => {
      setRetros({})
      localStorage.removeItem(STORAGE_KEY)
    },
  }
}
