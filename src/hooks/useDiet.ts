import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'vestori:diet'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch:     '점심',
  dinner:    '저녁',
  snack:     '간식',
}

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export interface DietItem {
  id: string
  name: string
  calories: number | null
  amount: string
}

export type DayDiet = Record<MealType, DietItem[]>

function emptyDay(): DayDiet {
  return { breakfast: [], lunch: [], dinner: [], snack: [] }
}

function load(): Record<string, DayDiet> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function useDiet() {
  const [records, setRecords] = useState<Record<string, DayDiet>>(() => load())

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) } catch {}
  }, [records])

  const getDay = (date: string): DayDiet =>
    records[date] ?? emptyDay()

  const addItem = (date: string, meal: MealType, item: Omit<DietItem, 'id'>) => {
    setRecords(prev => {
      const day = prev[date] ?? emptyDay()
      return { ...prev, [date]: { ...day, [meal]: [...day[meal], { ...item, id: uuidv4() }] } }
    })
  }

  const removeItem = (date: string, meal: MealType, id: string) => {
    setRecords(prev => {
      const day = prev[date] ?? emptyDay()
      return { ...prev, [date]: { ...day, [meal]: day[meal].filter(i => i.id !== id) } }
    })
  }

  const deleteDay = (date: string) => {
    setRecords(prev => { const n = { ...prev }; delete n[date]; return n })
  }

  const totalCalories = (date: string): number | null => {
    const day = records[date]
    if (!day) return null
    const items = MEAL_ORDER.flatMap(m => day[m])
    if (items.every(i => i.calories == null)) return null
    return items.reduce((s, i) => s + (i.calories ?? 0), 0)
  }

  return { records, getDay, addItem, removeItem, deleteDay, totalCalories }
}
