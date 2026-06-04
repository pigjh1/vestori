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
// Entry
// ─────────────────────────────────────────
export interface Entry {
  id: string
  text: string
  category: CategoryId | null
  tags: string[]               // 자유 태그
  createdAt: string            // ISO string
}

// ─────────────────────────────────────────
// Mood Record — 하루 기분 1~5
// ─────────────────────────────────────────
export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface MoodRecord {
  date: string      // 'yyyy-MM-dd'
  score: MoodScore
  note: string      // 짧은 한 줄 메모 (선택)
}
