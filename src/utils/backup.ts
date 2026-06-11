import { getAllImages, saveImage, clearAllImages } from '@/lib/imageDB'

const STORAGE_KEYS = [
  'vestori:entries',
  'vestori:moods',
  'vestori:habits',
  'vestori:checks',
  'vestori:diet',
  'vestori:retrospects',
  'vestori:threads',
  'vestori:design',
]

export interface BackupMeta {
  version: 1
  exportedAt: string
  deviceNote: string
}

export interface BackupFile {
  meta: BackupMeta
  localStorage: Record<string, string>
  images: { id: string; entryId: string; mimeType: string; data: string; createdAt: string }[]
}

export type MergeStrategy = 'overwrite' | 'merge'

// ArrayBuffer → base64
function bufferToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let b = ''
  bytes.forEach(v => b += String.fromCharCode(v))
  return btoa(b)
}

// base64 → ArrayBuffer
function b64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

export async function exportBackup(deviceNote = ''): Promise<void> {
  // localStorage 수집
  const ls: Record<string, string> = {}
  STORAGE_KEYS.forEach(k => {
    const v = localStorage.getItem(k)
    if (v) ls[k] = v
  })

  // 이미지 수집
  const allImgs = await getAllImages()
  const images = allImgs.map(img => ({
    id: img.id,
    entryId: img.entryId,
    mimeType: img.mimeType,
    data: bufferToB64(img.data),
    createdAt: img.createdAt,
  }))

  const backup: BackupFile = {
    meta: { version: 1, exportedAt: new Date().toISOString(), deviceNote },
    localStorage: ls,
    images,
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `vestori-backup-${date}.json`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importBackup(
  file: File,
  strategy: MergeStrategy
): Promise<{ entryCount: number; imageCount: number }> {
  const text = await file.text()
  const backup: BackupFile = JSON.parse(text)

  if (backup.meta?.version !== 1) throw new Error('지원하지 않는 백업 형식입니다')

  if (strategy === 'overwrite') {
    // 기존 데이터 초기화
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k))
    await clearAllImages()
    // 새 데이터 쓰기
    Object.entries(backup.localStorage).forEach(([k, v]) => localStorage.setItem(k, v))
  } else {
    // merge: entry, mood, diet, thread는 기존 + 새 것 합치기 (id 중복 제거)
    const mergeArrayKey = (key: string) => {
      const existing: any[] = JSON.parse(localStorage.getItem(key) ?? '[]')
      const incoming: any[] = JSON.parse(backup.localStorage[key] ?? '[]')
      const ids = new Set(existing.map((x: any) => x.id ?? x.dateTime ?? x.weekKey ?? x.monthKey))
      const merged = [...existing, ...incoming.filter((x: any) => {
        const id = x.id ?? x.dateTime ?? x.weekKey ?? x.monthKey
        return !ids.has(id)
      })]
      localStorage.setItem(key, JSON.stringify(merged))
    }

    const mergeObjectKey = (key: string) => {
      const existing = JSON.parse(localStorage.getItem(key) ?? '{}')
      const incoming = JSON.parse(backup.localStorage[key] ?? '{}')
      localStorage.setItem(key, JSON.stringify({ ...incoming, ...existing })) // 기존 우선
    }

    if (backup.localStorage['vestori:entries'])    mergeArrayKey('vestori:entries')
    if (backup.localStorage['vestori:moods'])      mergeArrayKey('vestori:moods')
    if (backup.localStorage['vestori:threads'])    mergeArrayKey('vestori:threads')
    if (backup.localStorage['vestori:habits'])     mergeArrayKey('vestori:habits')
    if (backup.localStorage['vestori:diet'])       mergeObjectKey('vestori:diet')
    if (backup.localStorage['vestori:retrospects'])mergeObjectKey('vestori:retrospects')
    if (backup.localStorage['vestori:checks'])     mergeObjectKey('vestori:checks')
    // design은 merge 시 유지
  }

  // 이미지 복원
  for (const img of backup.images ?? []) {
    await saveImage({
      id: img.id,
      entryId: img.entryId,
      mimeType: img.mimeType,
      data: b64ToBuffer(img.data),
      createdAt: img.createdAt,
    })
  }

  const entryCount = Object.keys(backup.localStorage).length
  return { entryCount, imageCount: backup.images?.length ?? 0 }
}
