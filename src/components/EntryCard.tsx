import { useState, KeyboardEvent } from 'react'
import type { Entry, CategoryId } from '@/types'
import { CATEGORIES } from '@/types'
import { formatTime } from '@/utils/date'
import { ImageUploader } from './ImageUploader'
import { ImageGallery } from './ImageGallery'

interface EntryCardProps {
  entry: Entry
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string, category: CategoryId | null, tags: string[], imageIds: string[]) => void
  onTagClick?: (tag: string) => void
}

export function EntryCard({ entry, onDelete, onUpdate, onTagClick }: EntryCardProps) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(entry.text)
  const [editCategory, setEditCategory] = useState<CategoryId | null>(entry.category)
  const [editTags, setEditTags] = useState<string[]>(entry.tags)
  const [editImageIds, setEditImageIds] = useState<string[]>(entry.imageIds)
  const [tagInput, setTagInput] = useState('')

  const categoryLabel = entry.category ? CATEGORIES.find(c => c.id === entry.category)?.label : null

  const startEdit = () => {
    setEditText(entry.text); setEditCategory(entry.category)
    setEditTags(entry.tags); setEditImageIds(entry.imageIds)
    setEditing(true)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    onUpdate(entry.id, editText.trim(), editCategory, editTags, editImageIds)
    setEditing(false)
  }

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !editTags.includes(t) && editTags.length < 10) setEditTags(prev => [...prev, t])
    setTagInput('')
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
    if (e.key === 'Backspace' && !tagInput && editTags.length > 0) setEditTags(prev => prev.slice(0, -1))
  }

  if (editing) return (
    <div className="py-6 border-b border-paper-border">
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} onClick={() => setEditCategory(editCategory === id ? null : id)}
            className={`font-sans text-[11px] px-2.5 py-1 rounded-sm border transition-all cursor-pointer
              ${editCategory === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
            {label}
          </button>
        ))}
      </div>

      <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus rows={4}
        className="w-full border border-paper-border rounded-sm px-3 py-2 font-body font-light text-ink bg-paper-warm outline-none focus:border-accent-light resize-none leading-[1.85] transition-colors" />

      {/* 이미지 편집 */}
      <ImageGallery imageIds={editImageIds} editable onRemove={id => setEditImageIds(prev => prev.filter(i => i !== id))} />
      <div className="mt-2">
        <ImageUploader entryId={entry.id} onUploaded={id => setEditImageIds(prev => [...prev, id])} />
      </div>

      {/* 태그 편집 */}
      <div className="flex flex-wrap gap-1.5 items-center mt-2">
        {editTags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 font-sans text-[11px] px-2 py-0.5 rounded-sm bg-accent-pale text-accent border border-accent/20">
            #{tag}
            <button onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="text-accent/60 hover:text-accent cursor-pointer">×</button>
          </span>
        ))}
        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown} placeholder="태그 추가"
          className="font-sans font-light bg-transparent outline-none placeholder:text-ink-faint border-b border-paper-border focus:border-accent-light py-0.5 min-w-[80px] transition-colors" />
      </div>

      <div className="flex gap-3 mt-3">
        <button onClick={saveEdit} className="font-sans text-[11px] bg-ink text-white px-3 py-1.5 rounded-sm hover:bg-accent transition-colors cursor-pointer">저장</button>
        <button onClick={() => setEditing(false)} className="font-sans text-[11px] text-ink-faint hover:text-ink border border-paper-border px-3 py-1.5 rounded-sm transition-colors cursor-pointer">취소</button>
      </div>
    </div>
  )

  return (
    <div className="py-6 border-b border-paper-border animate-fade-slide"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className="font-sans text-[11px] font-light text-ink-faint tracking-wide">{formatTime(entry.createdAt)}</span>
        {categoryLabel && (
          <span className="font-sans text-[10px] px-1.5 py-0.5 rounded-sm bg-accent-pale text-accent border border-accent/20">{categoryLabel}</span>
        )}
      </div>

      <p className="font-body font-light text-ink leading-[1.85] whitespace-pre-wrap break-words">{entry.text}</p>

      {/* 이미지 */}
      <ImageGallery imageIds={entry.imageIds} />

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.tags.map(tag => (
            <button key={tag} onClick={() => onTagClick?.(tag)}
              className="font-sans text-[11px] text-ink-faint hover:text-accent transition-colors cursor-pointer bg-none border-none p-0">
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className={`flex items-center gap-4 mt-2.5 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={startEdit} className="font-sans text-[11px] font-light text-ink-faint hover:text-accent tracking-wide bg-none border-none p-0 cursor-pointer transition-colors">수정</button>
        <button onClick={() => onDelete(entry.id)} className="font-sans text-[11px] font-light text-ink-faint hover:text-accent tracking-wide bg-none border-none p-0 cursor-pointer transition-colors">지우기</button>
      </div>
    </div>
  )
}
