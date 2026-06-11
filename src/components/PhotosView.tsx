import { useState, useEffect } from 'react'
import type { Entry } from '@/types'
import { getImages } from '@/lib/imageDB'
import { formatDateFull, formatTime } from '@/utils/date'

interface PhotoItem {
  dataUrl: string
  entryId: string
  entryText: string
  createdAt: string
}

export function PhotosView({ entries }: { entries: Entry[] }) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PhotoItem | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const items: PhotoItem[] = []
      const withImages = entries.filter(e => e.imageIds.length > 0)
      for (const entry of withImages) {
        const imgs = await getImages(entry.imageIds)
        for (const img of imgs) {
          const blob = new Blob([img.data], { type: img.mimeType })
          const dataUrl = await new Promise<string>(res => {
            const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob)
          })
          items.push({ dataUrl, entryId: entry.id, entryText: entry.text, createdAt: entry.createdAt })
        }
      }
      if (!cancelled) { setPhotos(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [entries])

  if (loading) return <div className="text-sm text-ink-faint py-12 text-center">사진 불러오는 중...</div>
  if (photos.length === 0) return <div className="text-sm text-ink-faint py-12 text-center italic">사진이 없어요</div>

  return (
    <div>
      <p className="text-sm text-ink-faint mb-4">{photos.length}장의 사진</p>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-sm cursor-pointer bg-paper-warm"
            onClick={() => setSelected(photo)}>
            <img src={photo.dataUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>

      {/* 라이트박스 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setSelected(null)}>
          {/* 딤드 배경 */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          {/* 컨텐츠 */}
          <div className="relative z-10 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={selected.dataUrl} alt=""
              className="w-full rounded-sm object-contain max-h-[65vh] shadow-2xl" />
            <div className="mt-2 bg-paper-card rounded-sm px-4 py-3 border border-paper-border shadow-sm">
              <p className="text-sm text-ink-muted mb-0.5">
                {formatDateFull(selected.createdAt.split('T')[0])} · {formatTime(selected.createdAt)}
              </p>
              {selected.entryText && (
                <p className="text-sm text-ink line-clamp-2">{selected.entryText}</p>
              )}
            </div>
            <button onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm cursor-pointer border-none bg-none transition-colors">
              ✕ 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
