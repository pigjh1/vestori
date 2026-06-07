import { useState, KeyboardEvent } from 'react'
import type { Entry, CategoryId, CategoryMeta, FoodMeta, ThreadPost } from '@/types'
import { CATEGORIES } from '@/types'
import { formatTime } from '@/utils/date'
import { ImageUploader } from './ImageUploader'
import { ImageGallery } from './ImageGallery'
import { FoodMetaFields } from './FoodMetaFields'
import { ThreadView } from './ThreadView'

interface EntryCardProps {
  entry: Entry
  posts: ThreadPost[]
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string, category: CategoryId | null, categoryMeta: CategoryMeta, tags: string[], imageIds: string[], location: string) => void
  onTagClick?: (tag: string) => void
  onAddPost: (entryId: string, text: string, imageIds: string[]) => void
  onDeletePost: (id: string) => void
}

function formatAmount(n: number) { return n.toLocaleString('ko-KR') + '원' }
function formatRating(r: number) { return r % 1 === 0 ? `${r}.0` : `${r}` }

export function EntryCard({ entry, posts, onDelete, onUpdate, onTagClick, onAddPost, onDeletePost }: EntryCardProps) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(entry.text)
  const [editCategory, setEditCategory] = useState<CategoryId | null>(entry.category)
  const [editFoodMeta, setEditFoodMeta] = useState<Partial<FoodMeta>>(entry.categoryMeta?.food ?? {})
  const [editTags, setEditTags] = useState<string[]>(entry.tags)
  const [editImageIds, setEditImageIds] = useState<string[]>(entry.imageIds)
  const [editLocation, setEditLocation] = useState(entry.location)
  const [tagInput, setTagInput] = useState('')

  const categoryLabel = entry.category ? CATEGORIES.find(c => c.id === entry.category)?.label : null
  const food = entry.categoryMeta?.food

  const startEdit = () => {
    setEditText(entry.text); setEditCategory(entry.category)
    setEditFoodMeta(entry.categoryMeta?.food ?? {})
    setEditTags(entry.tags); setEditImageIds(entry.imageIds)
    setEditLocation(entry.location); setEditing(true)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    const meta: CategoryMeta = editCategory === 'food' ? { food: editFoodMeta } : {}
    onUpdate(entry.id, editText.trim(), editCategory, meta, editTags, editImageIds, editLocation)
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
    <div className="py-5 border-b border-paper-border">
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id}
            onClick={() => { setEditCategory(editCategory === id ? null : id); setEditFoodMeta({}) }}
            className={`font-sans text-[12px] px-2.5 py-1 rounded-sm border transition-all cursor-pointer
              ${editCategory === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
            {label}
          </button>
        ))}
      </div>

      {editCategory === 'food' && (
        <div className="mb-3"><FoodMetaFields value={editFoodMeta} onChange={setEditFoodMeta} /></div>
      )}

      <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus rows={4}
        className="w-full border border-paper-border rounded-sm px-3 py-2 font-body font-light text-ink bg-paper-warm outline-none focus:border-accent-light resize-none leading-[1.85] transition-colors" />

      {/* 위치 편집 */}
      <input type="text" placeholder="위치 (선택)" value={editLocation}
        onChange={e => setEditLocation(e.target.value)} maxLength={60}
        className="mt-2 w-full font-sans text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-accent-light transition-colors" />

      <ImageGallery imageIds={editImageIds} editable
        onRemove={id => setEditImageIds(prev => prev.filter(i => i !== id))} />
      <div className="mt-2">
        <ImageUploader entryId={entry.id} onUploaded={id => setEditImageIds(prev => [...prev, id])} />
      </div>

      <div className="flex flex-wrap gap-1.5 items-center mt-2">
        {editTags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 font-sans text-[11px] px-2 py-0.5 rounded-sm bg-accent-pale text-accent border border-accent/20">
            #{tag}
            <button onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="text-accent/60 hover:text-accent cursor-pointer">×</button>
          </span>
        ))}
        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown} placeholder="태그 추가"
          className="font-sans bg-transparent outline-none placeholder:text-ink-faint border-b border-paper-border focus:border-accent-light py-0.5 min-w-[80px] transition-colors" />
      </div>

      <div className="flex gap-3 mt-3">
        <button onClick={saveEdit}
          className="font-sans text-[13px] bg-ink text-white px-3 py-1.5 rounded-sm hover:bg-accent transition-colors cursor-pointer">저장</button>
        <button onClick={() => setEditing(false)}
          className="font-sans text-[13px] text-ink-faint border border-paper-border px-3 py-1.5 rounded-sm cursor-pointer">취소</button>
      </div>
    </div>
  )

  return (
    <div className="py-5 border-b border-paper-border animate-fade-slide"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      {/* 메타 */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="font-sans text-[12px] text-ink-faint">{formatTime(entry.createdAt)}</span>
        {categoryLabel && (
          <span className="font-sans text-[11px] px-1.5 py-0.5 rounded-sm bg-accent-pale text-accent border border-accent/20">{categoryLabel}</span>
        )}
        {entry.location && (
          <span className="font-sans text-[11px] text-ink-faint">📍 {entry.location}</span>
        )}
        {food?.amount != null && (
          <span className="font-sans text-[11px] text-ink-faint">{formatAmount(food.amount)}</span>
        )}
        {food?.rating != null && (
          <span className="font-sans text-[11px] text-ink-faint">⭐ {formatRating(food.rating)}</span>
        )}
      </div>

      <p className="font-body font-light text-ink leading-[1.85] whitespace-pre-wrap break-words">{entry.text}</p>
      <ImageGallery imageIds={entry.imageIds} />

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {entry.tags.map(tag => (
            <button key={tag} onClick={() => onTagClick?.(tag)}
              className="font-sans text-[12px] text-ink-faint hover:text-accent transition-colors cursor-pointer bg-none border-none p-0">
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className={`flex items-center gap-4 mt-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={startEdit}
          className="font-sans text-[12px] text-ink-faint hover:text-accent bg-none border-none p-0 cursor-pointer transition-colors">수정</button>
        <button onClick={() => onDelete(entry.id)}
          className="font-sans text-[12px] text-ink-faint hover:text-accent bg-none border-none p-0 cursor-pointer transition-colors">지우기</button>
      </div>

      {/* 타래 */}
      <ThreadView
        entryId={entry.id}
        posts={posts}
        onAdd={onAddPost}
        onDelete={onDeletePost}
      />
    </div>
  )
}
