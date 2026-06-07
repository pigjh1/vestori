import type { Entry } from '@/types'
import { CATEGORIES } from '@/types'
import { getImages, bufferToBase64 } from '@/lib/imageDB'
import { getDateKey, formatDateFilename, formatDateFull, formatTime, startOfDay, endOfDay, eachDayOfInterval } from '@/utils/date'

async function entryToMd(entry: Entry): Promise<string> {
  const lines: string[] = []
  lines.push(`### ${formatTime(entry.createdAt)}`)
  lines.push('')
  lines.push(entry.text)

  const food = entry.categoryMeta?.food
  const metaParts = []
  if (entry.location) metaParts.push(`📍 ${entry.location}`)
  if (food?.amount != null) metaParts.push(`💳 ${food.amount.toLocaleString('ko-KR')}원`)
  if (food?.rating != null) metaParts.push(`⭐ ${food.rating}/5`)
  if (metaParts.length > 0) { lines.push(''); lines.push(metaParts.join('  ')) }

  if (entry.imageIds.length > 0) {
    const images = await getImages(entry.imageIds)
    images.forEach((img, i) => { lines.push(''); lines.push(`![이미지 ${i + 1}](${bufferToBase64(img.data, img.mimeType)})`) })
  }

  if (entry.tags.length > 0) { lines.push(''); lines.push(entry.tags.map(t => `\`#${t}\``).join(' ')) }
  return lines.join('\n')
}

async function buildFileContent(dateLabel: string, categoryLabel: string | null, entries: Entry[]): Promise<string> {
  const sorted = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const lines = [`# ${dateLabel}${categoryLabel ? ` — ${categoryLabel}` : ''}`, '', `> ${sorted.length}개의 기록`, '', '---', '']
  for (let i = 0; i < sorted.length; i++) {
    lines.push(await entryToMd(sorted[i]))
    if (i < sorted.length - 1) { lines.push(''); lines.push('---'); lines.push('') }
  }
  return lines.join('\n')
}

async function buildDayFiles(dateKey: string, entries: Entry[]): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const base = formatDateFilename(dateKey)
  const dateLabel = formatDateFull(dateKey)
  const byCategory: Record<string, Entry[]> = {}
  const uncategorized: Entry[] = []
  entries.forEach(e => {
    if (e.category) { if (!byCategory[e.category]) byCategory[e.category] = []; byCategory[e.category].push(e) }
    else uncategorized.push(e)
  })

  if (Object.keys(byCategory).length === 0) { files[base] = await buildFileContent(dateLabel, null, uncategorized); return files }
  if (uncategorized.length > 0) files[base] = await buildFileContent(dateLabel, null, uncategorized)
  for (const [catId, catEntries] of Object.entries(byCategory)) {
    const catLabel = CATEGORIES.find(c => c.id === catId)?.label ?? catId
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
  a.href = url; a.download = `${filename}.md`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

export interface ExportResult { fileCount: number; dayCount: number }

export async function exportEntries(allEntries: Entry[], startDate: string, endDate: string): Promise<ExportResult> {
  const days = eachDayOfInterval(new Date(startDate), new Date(endDate))
  const allFiles: Record<string, string> = {}
  let dayCount = 0

  for (const day of days) {
    const dateKey = getDateKey(day.toISOString())
    const s = startOfDay(day).getTime(), e = endOfDay(day).getTime()
    const dayEntries = allEntries.filter(en => { const t = new Date(en.createdAt).getTime(); return t >= s && t <= e })
    if (dayEntries.length === 0) continue
    dayCount++
    Object.assign(allFiles, await buildDayFiles(dateKey, dayEntries))
  }

  const entries = Object.entries(allFiles)
  for (let i = 0; i < entries.length; i++) {
    downloadFile(entries[i][0], entries[i][1])
    if (i < entries.length - 1) await new Promise(r => setTimeout(r, 300))
  }
  return { fileCount: entries.length, dayCount }
}
