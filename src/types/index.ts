export type Mood = '✦' | '♡' | '◎' | '☁' | '✿'

export interface Entry {
  id: string
  text: string
  mood: Mood
  createdAt: string // ISO string
  liked: boolean
}
