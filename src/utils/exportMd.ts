import type { Entry } from '@/types'
import { CATEGORIES } from '@/types'
import { getImages, bufferToBase64 } from '@/lib/imageDB'
import { getDateKey, formatDateFull, formatTime, startOfDay, endOfDay, eachDayOfInterval, pad } from '@/utils/date'

async function entryToMd(entry: Entry): Promise<string> {
  const lines: string[] = []
  
  // 시간 — 타임라인 강조
  const timeStr = formatTime(entry.createdAt)
  lines.push(`---`)
  lines.push(`**${timeStr}**`)
  lines.push(`---`)
  lines.push('')
  
  // 본문
  lines.push(entry.text)

  // 메타 정보
  const food = entry.categoryMeta?.food
  const metaParts = []
  if (entry.location) metaParts.push(`📍 ${entry.location}`)
  if (food?.amount != null) metaParts.push(`💳 ${food.amount.toLocaleString('ko-KR')}원`)
  if (food?.rating != null) metaParts.push(`⭐ ${food.rating}/5`)
  if (metaParts.length > 0) { lines.push(''); lines.push(metaParts.join('  ')) }

  // 이미지
  if (entry.imageIds.length > 0) {
    const images = await getImages(entry.imageIds)
    images.forEach((img, i) => { lines.push(''); lines.push(`![이미지 ${i + 1}](${bufferToBase64(img.data, img.mimeType)})`) })
  }

  // 태그
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

// 날짜 파일명: YYYY.MM.DD.요일.md
function formatDateFileName(dateKey: string): string {
  const d = new Date(dateKey)
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const KO_DAYS = ['일','월','화','수','목','금','토']
  const dayName = KO_DAYS[d.getDay()]
  return `${yyyy}.${mm}.${dd}.${dayName}`
}

// 카테고리 파일명: YYMMDD - 제목.md
function formatCategoryFileName(dateKey: string, title: string): string {
  const d = new Date(dateKey)
  const yy = String(d.getFullYear()).slice(2)
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const yymmdd = `${yy}${mm}${dd}`
  const truncated = title.length > 40 ? title.slice(0, 40) : title
  return `${yymmdd} - ${truncated}`.replace(/[/\\:*?"<>|]/g, '_')
}

async function buildDayFiles(dateKey: string, entries: Entry[]): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const dateLabel = formatDateFull(dateKey)
  
  // 카테고리별 분류
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

  const catCount = Object.keys(byCategory).length
  const hasUncategorized = uncategorized.length > 0

  // 케이스 1: 카테고리 없음만 (또는 기록 하나)
  if (catCount === 0) {
    const fileName = formatDateFileName(dateKey)
    files[fileName] = await buildFileContent(dateLabel, null, uncategorized)
    return files
  }

  // 케이스 2: 카테고리 하나만 있고 uncategorized 없음 → 날짜 파일명
  if (catCount === 1 && !hasUncategorized) {
    const [catId, catEntries] = Object.entries(byCategory)[0]
    const catLabel = CATEGORIES.find(c => c.id === catId)?.label ?? catId
    const fileName = formatDateFileName(dateKey)
    files[fileName] = await buildFileContent(dateLabel, catLabel, catEntries)
    return files
  }

  // 케이스 3: 여러 카테고리 또는 uncategorized + 카테고리 섞임 → 카테고리별 파일
  // uncategorized 처리
  if (hasUncategorized) {
    const fileName = formatCategoryFileName(dateKey, '기타')
    files[fileName] = await buildFileContent(dateLabel, null, uncategorized)
  }

  // 카테고리별 파일
  for (const [catId, catEntries] of Object.entries(byCategory)) {
    const catLabel = CATEGORIES.find(c => c.id === catId)?.label ?? catId
    const fileName = formatCategoryFileName(dateKey, catLabel)
    files[fileName] = await buildFileContent(dateLabel, catLabel, catEntries)
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

export async function exportEntries(
  allEntries: Entry[], 
  startDate: string, 
  endDate: string
): Promise<ExportResult> {
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
