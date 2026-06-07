

const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토']
const KO_DAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토']

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function getDateKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey(): string {
  return getDateKey(new Date().toISOString())
}

export function isToday(iso: string): boolean {
  return getDateKey(iso) === todayKey()
}

export function isYesterday(iso: string): boolean {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return getDateKey(iso) === getDateKey(y.toISOString())
}

export function formatDateLabel(iso: string): string {
  if (isToday(iso)) return '오늘'
  if (isYesterday(iso)) return '어제'
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function formatDateFull(dateKey: string): string {
  // 'yyyy-MM-dd' → 'yyyy년 M월 d일 (요)'
  const d = new Date(dateKey)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_DAYS[d.getDay()]})`
}

export function formatDateFilename(dateKey: string): string {
  // 'yyyy-MM-dd' → 'yyyy.MM.dd.요'
  const d = new Date(dateKey)
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const day = KO_DAYS[d.getDay()]
  return `${y}.${m}.${dd}.${day}`
}

export function formatMonthLabel(yearMonth: string): string {
  // 'yyyy-MM' → 'yyyy년 M월'
  const [y, m] = yearMonth.split('-')
  return `${y}년 ${parseInt(m)}월`
}

export function formatDateShort(dateKey: string): string {
  // 'yyyy-MM-dd' → 'M월 d일 (요)'
  const d = new Date(dateKey)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_DAYS_SHORT[d.getDay()]})`
}

export function formatDateSlash(dateKey: string): string {
  // 'yyyy-MM-dd' → 'M/d'
  const d = new Date(dateKey)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function formatMonthDayWeek(dateKey: string): string {
  const d = new Date(dateKey)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_DAYS[d.getDay()]})`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_DAYS[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateDot(dateKey: string): string {
  // 'yyyy-MM-dd' → 'yyyy.MM.dd'
  return dateKey.replace(/-/g, '.')
}

export function subDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(start)
  cur.setHours(0, 0, 0, 0)
  const endTs = new Date(end).setHours(0, 0, 0, 0)
  while (cur.getTime() <= endTs) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export function localDatetimeDefault(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function isFutureDate(dateKey: string): boolean {
  return dateKey > todayKey()
}

export function getDayOfWeek(dateKey: string): number {
  return new Date(dateKey).getDay()
}

export function getYear(dateKey: string): number {
  return new Date(dateKey).getFullYear()
}

export function getMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7)
}
