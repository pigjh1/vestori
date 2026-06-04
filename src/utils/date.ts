import { format, isToday, isYesterday } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return '오늘'
  if (isYesterday(d)) return '어제'
  return format(d, 'yyyy년 M월 d일', { locale: ko })
}

export function getDateKey(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd')
}
