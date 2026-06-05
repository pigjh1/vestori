import { format, eachDayOfInterval, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Entry } from '@/types'
import { CATEGORIES } from '@/types'
import { getImages, bufferToBase64 } from '@/lib/imageDB'

function dateToFilename(dateKey: string): string {
  return format(parseISO(dateKey), 'yyyy.MM.dd.EEE', { locale: ko })
}

async function entryToMd(entry: Entry): Promise<string> {
  const time = format(parseISO(entry.createdAt), 'HH:mm')
  const lines: string[] = []
  lines.push(`### ${time}`)
  lines.push('')
  lines.push(entry.text)

  // 이미지 — base64 inline 이미지로 삽입
  if (entry.imageIds.length > 0) {
    const images = await getImages(entry.imageIds)
    images.forEach((img, i) => {
      lines.push('')
      lines.push(`![이미지 ${i + 1}](${bufferToBase64(img.data, img.mimeType)})`)
    })
  }

  if (entry.tags.length > 0) {
    lines.push('')
    lines.push(entry.tags.map(t => `\`#${t}\``).join(' '))
  }
  return lines.join('\n')
}

function buildFileContent(dateLabel: string, categoryLabel: string | null, entries: Entry[]): Promise<string> {
  const sorted = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (async () => {
    const lines: string[] = []
    lines.push(`# ${dateLabel}${categoryLabel ? ` — ${categoryLabel}` : ''}`)
    lines.push('')
    lines.push(`> ${sorted.length}개의 기록`)
    lines.push('')
    lines.push('---')
    lines.push('')

    for (let i = 0; i < sorted.length; i++) {
      lines.push(await entryToMd(sorted[i]))
      if (i < sorted.length - 1) { lines.push(''); lines.push('---'); lines.push('') }
    }
    return lines.join('\n')
  })()
}

async function buildDayFiles(dateKey: string, entries: Entry[]): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const base = dateToFilename(dateKey)
  const dateLabel = format(parseISO(dateKey), 'yyyy년 M월 d일 (E)', { locale: ko })

  const byCategory: Record<string, Entry[]> = {}
  const uncategorized: Entry[] = []

  entries.forEach(e => {
    if (e.category) {
      if (!byCategory[e.category]) byCategory[e.category] = []
      byCategory[e.category].push(e)
    } else {
      uncategorized.push(e)
    }
  })

  // 카테고리 없음 → 단일 파일
  if (Object.keys(byCategory).length === 0) {
    files[base] = await buildFileContent(dateLabel, null, uncategorized)
    return files
  }

  // 미분류
  if (uncategorized.length > 0) {
    files[base] = await buildFileContent(dateLabel, null, uncategorized)
  }

  // 카테고리별
  for (const [catId, catEntries] of Object.entries(byCategory)) {
    const catLabel = CATEGORIES.find(c => c.id === catId)?.label ?? catId

    // 카테고리만 있고 하나뿐이면 단일 파일
    if (uncategorized.length === 0 && Object.keys(byCategory).length === 1) {
      files[base] = await buildFileContent(dateLabel, catLabel, catEntries)
    } else {
      files[`${base}.${catLabel}`] = await buildFileContent(dateLabel, catLabel, catEntries)
    }
  }

  return files
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ExportResult { fileCount: number; dayCount: number }

export async function exportEntries(
  allEntries: Entry[],
  startDate: string,
  endDate: string,
): Promise<ExportResult> {
  const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
  const allFiles: Record<string, string> = {}
  let dayCount = 0

  for (const day of days) {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayStart = startOfDay(day).getTime()
    const dayEnd = endOfDay(day).getTime()
    const dayEntries = allEntries.filter(e => {
      const t = new Date(e.createdAt).getTime()
      return t >= dayStart && t <= dayEnd
    })
    if (dayEntries.length === 0) continue
    dayCount++
    const files = await buildDayFiles(dateKey, dayEntries)
    Object.assign(allFiles, files)
  }

  const entries = Object.entries(allFiles)
  for (let i = 0; i < entries.length; i++) {
    downloadFile(entries[i][0], entries[i][1])
    if (i < entries.length - 1) await new Promise(r => setTimeout(r, 300))
  }

  return { fileCount: entries.length, dayCount }
}
