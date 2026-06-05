import { useEffect, useState } from 'react'

import { getImages, deleteImage, bufferToObjectURL } from '@/lib/imageDB'

interface ImageGalleryProps {
  imageIds: string[]
  editable?: boolean
  onRemove?: (imageId: string) => void
}

interface LoadedImage {
  id: string
  url: string
  mimeType: string
}

export function ImageGallery({ imageIds, editable, onRemove }: ImageGalleryProps) {
  const [images, setImages] = useState<LoadedImage[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (imageIds.length === 0) { setImages([]); return }
    let cancelled = false
    const prevUrls: string[] = []

    getImages(imageIds).then(records => {
      if (cancelled) return
      // 이전 object URL 해제
      prevUrls.forEach(URL.revokeObjectURL)
      const loaded: LoadedImage[] = records.map(r => ({
        id: r.id,
        url: bufferToObjectURL(r.data, r.mimeType),
        mimeType: r.mimeType,
      }))
      setImages(loaded)
      prevUrls.push(...loaded.map(l => l.url))
    })

    return () => {
      cancelled = true
      prevUrls.forEach(URL.revokeObjectURL)
    }
  }, [imageIds.join(',')])

  const handleRemove = async (id: string) => {
    await deleteImage(id)
    setImages(prev => {
      const removed = prev.find(i => i.id === id)
      if (removed) URL.revokeObjectURL(removed.url)
      return prev.filter(i => i.id !== id)
    })
    onRemove?.(id)
  }

  if (images.length === 0) return null

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        {images.map(img => (
          <div key={img.id} className="relative group">
            <img
              src={img.url}
              alt=""
              onClick={() => setLightbox(img.url)}
              className="w-20 h-20 object-cover rounded-sm border border-paper-border cursor-zoom-in
                hover:border-accent-light transition-colors"
            />
            {editable && (
              <button
                onClick={() => handleRemove(img.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink text-paper
                  font-sans text-[10px] flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-40 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full object-contain rounded-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-sm bg-ink/60 text-paper
              font-sans text-[16px] flex items-center justify-center cursor-pointer hover:bg-ink"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
