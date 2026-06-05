import type { ImageRecord } from '@/types'

const DB_NAME    = 'vestori'
const DB_VERSION = 1
const STORE      = 'images'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

export async function saveImage(record: ImageRecord): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function getImage(id: string): Promise<ImageRecord | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror   = () => reject(req.error)
  })
}

export async function getImages(ids: string[]): Promise<ImageRecord[]> {
  if (ids.length === 0) return []
  const results = await Promise.all(ids.map(getImage))
  return results.filter(Boolean) as ImageRecord[]
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function deleteImages(ids: string[]): Promise<void> {
  await Promise.all(ids.map(deleteImage))
}

export async function getAllImages(): Promise<ImageRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

// IndexedDB 전체 삭제
export async function clearAllImages(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

// IndexedDB 총 용량 추정 (bytes)
export async function getStorageSize(): Promise<number> {
  const images = await getAllImages()
  return images.reduce((sum, img) => sum + img.data.byteLength, 0)
}

export function bufferToObjectURL(buffer: ArrayBuffer, mimeType: string): string {
  return URL.createObjectURL(new Blob([buffer], { type: mimeType }))
}

export function bufferToBase64(buffer: ArrayBuffer, mimeType: string): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return `data:${mimeType};base64,${btoa(binary)}`
}
