// ─────────────────────────────────────────
// 카테고리
// ─────────────────────────────────────────
export const CATEGORIES = [
  { id: 'food',        label: '음식' },
  { id: 'place',       label: '장소' },
  { id: 'performance', label: '공연' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']

export interface FoodMeta {
  amount: number | null
  rating: number | null
}

export type CategoryMeta = {
  food?: Partial<FoodMeta>
}

// ─────────────────────────────────────────
// Image
// ─────────────────────────────────────────
export interface ImageRecord {
  id: string
  entryId: string
  mimeType: string
  data: ArrayBuffer
  createdAt: string
}

// ─────────────────────────────────────────
// Entry
// ─────────────────────────────────────────
export interface Entry {
  id: string
  text: string
  category: CategoryId | null
  categoryMeta: CategoryMeta
  tags: string[]
  imageIds: string[]
  location: string
  createdAt: string
}

// ─────────────────────────────────────────
// Mood Record
// ─────────────────────────────────────────
export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface MoodRecord {
  date: string
  score: MoodScore
  note: string
}

// ─────────────────────────────────────────
// Thread (트위터 스레드)
// ─────────────────────────────────────────
export interface ThreadPost {
  id: string
  entryId: string
  text: string
  imageIds: string[]
  createdAt: string
}

// ─────────────────────────────────────────
// 디자인 설정 — 폰트 산세리프만, 색상 동적
// ─────────────────────────────────────────
export type FontFamily = 'sans' | 'grotesque' | 'mono'

export interface DesignSettings {
  font: FontFamily
  accentHue: number  // 0~360
}
