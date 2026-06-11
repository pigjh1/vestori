import type { Entry } from '@/types'
import { CATEGORIES } from '@/types'
import { getImages, bufferToBase64 } from '@/lib/imageDB'
import { getDateKey, formatDateFull, formatTime, startOfDay, endOfDay, eachDayOfInterval } from '@/utils/date'

async function entryToMd(entry: Entry): Promise<string> {
  const lines: string[] = []
  const timeStr = formatTime(entry.createdAt)
  lines.push(`---`)
  lines.push(`**${timeStr}**`)
  lines.push(`---`)
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

// 날짜 파일명: YYYY.MM.DD.요일.md (카테고리 없을 때)
function formatDateFileName(dateKey: string): string {
  const parts = dateKey.split('-')
  const yyyy = parts[0]
  const mm = parts[1]
  const dd = parts[2]
  
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const KO_DAYS = ['일','월','화','수','목','금','토']
  const dayName = KO_DAYS[d.getDay()]
  
  return `${yyyy}.${mm}.${dd}.${dayName}`
}

// 카테고리 파일명: YYMMDD - 제목.md
function formatCategoryFileName(dateKey: string, title: string): string {
  const parts = dateKey.split('-')
  const yyyy = parts[0]
  const mm = parts[1]
  const dd = parts[2]
  
  const yy = yyyy.slice(2)
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

  // 카테고리 없음만 → 날짜 파일명
  if (catCount === 0) {
    const fileName = formatDateFileName(dateKey)
    files[fileName] = await buildFileContent(dateLabel, null, uncategorized)
    return files
  }

  // 카테고리가 있음
  // uncategorized가 있으면 → 항상 날짜 파일명으로
  if (uncategorized.length > 0) {
    const fileName = formatDateFileName(dateKey)
    files[fileName] = await buildFileContent(dateLabel, null, uncategorized)
  }

  // 카테고리별 → 각각 YYMMDD - 제목 형식 파일
  for (const [catId, catEntries] of Object.entries(byCategory)) {
    const catLabel = CATEGORIES.find(c => c.id === catId)?.label ?? catId
    const title = catEntries[0]?.title || catLabel
    const fileName = formatCategoryFileName(dateKey, title)
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

async function downloadZip(files: Record<string, string>) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  Object.entries(files).forEach(([name, content]) => zip.file(`${name}.md`, content))
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url; a.download = `vestori-${date}.zip`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

export interface ExportResult { fileCount: number; dayCount: number }

export async function exportEntries(
  allEntries: Entry[],
  moodRecords: any[],
  habits: any[],
  retros: Record<string, any>,
  startDate: string,
  endDate: string,
  asZip = false
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

  // 기분 기록 내보내기
  const moodInRange = moodRecords.filter(e => {
    const d = e.dateTime?.split(' ')[0]
    return d >= startDate && d <= endDate
  })
  if (moodInRange.length > 0) {
    let content = '# 기분 기록\n\n'
    const byDate: Record<string, any[]> = {}
    moodInRange.forEach(e => {
      const d = e.dateTime.split(' ')[0]
      if (!byDate[d]) byDate[d] = []
      byDate[d].push(e)
    })
    Object.entries(byDate).sort().forEach(([date, recs]) => {
      const avg = (recs.reduce((s: number, r: any) => s + r.score, 0) / recs.length).toFixed(1)
      content += `## ${date}  (평균 ${avg})\n`
      recs.forEach((r: any) => { content += `- ${r.dateTime.split(' ')[1]} — ${r.score}점\n` })
      content += '\n'
    })
    allFiles['_mood_summary'] = content
  }

  // 루틴 내보내기
  if (habits.length > 0) {
    let content = '# 루틴\n\n'
    habits.forEach((h: any) => { content += `- ${h.name}\n` })
    allFiles['_routine_summary'] = content
  }

  // 회고 내보내기
  const retroKeys = Object.keys(retros).filter(k => k >= startDate.slice(0, 7) || k.includes('-W'))
  if (retroKeys.length > 0) {
    let content = '# 회고\n\n'
    retroKeys.sort().forEach(key => {
      const r = retros[key]
      if (r.type === 'weekly') {
        content += `## 📆 ${key}\n\n`
        if (r.wins) content += `### ✅ 이번 주 잘한 것\n${r.wins}\n\n`
        if (r.learnings) content += `### 📚 배운 것\n${r.learnings}\n\n`
        if (r.challenges) content += `### 😤 힘들었던 것\n${r.challenges}\n\n`
        if (r.next_focus) content += `### 🎯 다음 주 집중할 것\n${r.next_focus}\n\n`
        if (r.energy) content += `### ⚡ 에너지\n${r.energy}\n\n`
      } else {
        content += `## 📋 ${key}\n\n`
        if (r.achievements_work) content += `### 🙌 성과 (Work)\n${r.achievements_work}\n\n`
        if (r.achievements_personal) content += `### 🙌 성과 (개인)\n${r.achievements_personal}\n\n`
        if (r.improvements) content += `### 🌱 개선할 사항\n${r.improvements}\n\n`
        if (r.ideas) content += `### 💡 개선 아이디어\n${r.ideas}\n\n`
        if (r.actions) content += `### ✔ 액션 아이템\n${r.actions}\n\n`
        if (r.others) content += `### 기타\n${r.others}\n\n`
      }
      content += '---\n\n'
    })
    allFiles['_retrospect_summary'] = content
  }

  const fileEntries = Object.entries(allFiles)

  if (asZip) {
    await downloadZip(allFiles)
  } else {
    for (let i = 0; i < fileEntries.length; i++) {
      downloadFile(fileEntries[i][0], fileEntries[i][1])
      if (i < fileEntries.length - 1) await new Promise(r => setTimeout(r, 300))
    }
  }
  return { fileCount: fileEntries.length, dayCount }
}
