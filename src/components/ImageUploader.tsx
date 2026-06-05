import { useRef, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ImageRecord } from '@/types'
import { saveImage } from '@/lib/imageDB'

interface ImageUploaderProps {
  entryId: string
  onUploaded: (imageId: string) => void
}

const MAX_SIZE_MB = 10
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function ImageUploader({ entryId, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('JPG, PNG, GIF, WebP 파일만 가능해요')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`${MAX_SIZE_MB}MB 이하 파일만 가능해요`)
      return
    }
    const buffer = await file.arrayBuffer()
    const record: ImageRecord = {
      id: uuidv4(),
      entryId,
      mimeType: file.type,
      data: buffer,
      createdAt: new Date().toISOString(),
    }
    await saveImage(record)
    onUploaded(record.id)
  }, [entryId, onUploaded])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(processFile)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={`flex items-center justify-center gap-2 border border-dashed rounded-sm px-4 py-3 cursor-pointer transition-all
          ${dragging
            ? 'border-accent bg-accent-pale'
            : 'border-paper-border hover:border-accent-light hover:bg-paper-warm'
          }`}
      >
        <span className="text-[14px] text-ink-faint">⊕</span>
        <span className="font-sans text-[11px] text-ink-faint font-light">
          이미지 추가 · 드래그 또는 클릭
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {error && <p className="font-sans text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}
