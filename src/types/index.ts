// ─────────────────────────────────────────
// 카테고리 — 여기에 추가/수정하면 전체 반영
// ─────────────────────────────────────────
export const CATEGORIES = [
  { id: 'food',        label: '음식' },
  { id: 'place',       label: '장소' },
  { id: 'performance', label: '공연' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']

// ─────────────────────────────────────────
// Image — IndexedDB에 별도 저장
// ─────────────────────────────────────────
export interface ImageRecord {
  id: string        // uuid
  entryId: string   // 연결된 Entry id
  mimeType: string  // 'image/jpeg' etc
  data: ArrayBuffer // 원본 바이너리
  createdAt: string
}

// ─────────────────────────────────────────
// Entry
// ─────────────────────────────────────────
export interface Entry {
  id: string
  text: string
  category: CategoryId | null
  tags: string[]
  imageIds: string[]   // ImageRecord id 목록
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
