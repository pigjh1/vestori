import { useRef, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ImageRecord } from '@/types'
import { saveImage } from '@/lib/imageDB'

interface ImageUploaderProps {
  entryId: string
  onUploaded: (imageId: string) => void
  compact?: boolean  // 스레드용 아이콘 버튼
}

const MAX_SIZE_MB = 10
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function ImageUploader({ entryId, onUploaded, compact = false }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setError(null)
    if (!ACCEPTED.includes(file.type)) { setError('JPG, PNG, GIF, WebP만 가능해요'); return }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { setError(`${MAX_SIZE_MB}MB 이하만 가능해요`); return }
    const buffer = await file.arrayBuffer()
    const record: ImageRecord = {
      id: uuidv4(), entryId, mimeType: file.type, data: buffer,
      createdAt: new Date().toISOString(),
    }
    await saveImage(record)
    onUploaded(record.id)
  }, [entryId, onUploaded])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(processFile)
  }

  if (compact) return (
    <button type="button" onClick={() => inputRef.current?.click()}
      className="w-7 h-7 flex items-center justify-center text-ink-faint hover:text-accent transition-colors cursor-pointer bg-none border-none">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="5.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1 11l3.5-3.5L8 11l3-2.5L15 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />
    </button>
  )

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={`flex items-center justify-center gap-2 border border-dashed rounded-sm px-4 py-2.5 cursor-pointer transition-all
          ${dragging ? 'border-accent bg-accent-pale' : 'border-paper-border hover:border-accent-light hover:bg-paper-warm'}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="0.5" y="2.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M0.5 10l3-3 3 3 2.5-2L13 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-sans text-[11px] text-ink-faint">사진 추가</span>
      </div>
      <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />
      {error && <p className="font-sans text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}
