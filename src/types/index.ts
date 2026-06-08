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

export type CategoryMeta = { food?: Partial<FoodMeta> }

export interface ImageRecord {
  id: string
  entryId: string
  mimeType: string
  data: ArrayBuffer
  createdAt: string
}

export interface Entry {
  id: string
  title: string
  text: string
  category: CategoryId | null
  categoryMeta: CategoryMeta
  tags: string[]
  imageIds: string[]
  location: string
  createdAt: string
}

export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface MoodRecord {
  date: string
  score: MoodScore
  note: string
}

export interface ThreadPost {
  id: string
  entryId: string
  text: string
  imageIds: string[]
  createdAt: string
}

export type FontFamily = 'noto-sans' | 'noto-serif' | 'gowun-batang' | 'gowun-dodum' | 'noto-brush' | 'noto-pen' | 'jetbrains-mono'

export const FONTS: { id: FontFamily; label: string; desc: string }[] = [
  { id: 'noto-sans', label: '노토산스', desc: '기본, 명확함' },
  { id: 'noto-serif', label: '노토세리프', desc: '정중함' },
  { id: 'gowun-batang', label: '고운바탕', desc: '우아함' },
  { id: 'gowun-dodum', label: '고운돋움', desc: '친근함' },
  { id: 'noto-brush', label: '손글씨(붓)', desc: '동글동글' },
  { id: 'noto-pen', label: '손글씨(펜)', desc: '귀여움' },
  { id: 'jetbrains-mono', label: '모노스페이스', desc: '코드감' },
]

export interface DesignSettings {
  font: FontFamily
  accentHue: number
}
