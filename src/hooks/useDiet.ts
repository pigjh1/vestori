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

  const reorderItem = (date: string, meal: MealType, id: string, dir: 'up' | 'down') => {
    setRecords(prev => {
      const day = prev[date] ?? emptyDay()
      const items = [...day[meal]]
      const idx = items.findIndex(i => i.id === id)
      if (idx === -1) return prev
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= items.length) return prev
      ;[items[idx], items[newIdx]] = [items[newIdx], items[idx]]
      return { ...prev, [date]: { ...day, [meal]: items } }
    })
  }

  const deleteDay = (date: string) => {
    setRecords(prev => { const n = { ...prev }; delete n[date]; return n })
  }

  const updateItem = (date: string, meal: MealType, id: string, name: string) => {
    setRecords(prev => {
      const day = prev[date] ?? emptyDay()
      return { ...prev, [date]: { ...day, [meal]: day[meal].map(i => i.id === id ? { ...i, name } : i) } }
    })
  }

  return { records, getDay, addItem, updateItem, removeItem, reorderItem, deleteDay }
}
