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
  onUpdate: (id: string, title: string, text: string, category: CategoryId | null, categoryMeta: CategoryMeta, tags: string[], imageIds: string[], location: string) => void
  onTagClick?: (tag: string) => void
  onAddPost: (entryId: string, text: string, imageIds: string[]) => void
  onDeletePost: (id: string) => void
}

function formatAmount(n: number) { return n.toLocaleString('ko-KR') + '원' }
function formatRating(r: number) { return r % 1 === 0 ? `${r}.0` : `${r}` }

export function EntryCard({ entry, posts, onDelete, onUpdate, onTagClick, onAddPost, onDeletePost }: EntryCardProps) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(entry.title)
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
    setEditTitle(entry.title); setEditText(entry.text); setEditCategory(entry.category)
    setEditFoodMeta(entry.categoryMeta?.food ?? {})
    setEditTags(entry.tags); setEditImageIds(entry.imageIds)
    setEditLocation(entry.location); setEditing(true)
  }

  const saveEdit = () => {
    if (!editText.trim() && !editTitle.trim()) return
    const meta: CategoryMeta = editCategory === 'food' ? { food: editFoodMeta } : {}
    onUpdate(entry.id, editTitle.trim(), editText.trim(), editCategory, meta, editTags, editImageIds, editLocation)
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
      <input type="text" placeholder="제목" value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={60}
        className="w-full border-none outline-none bg-transparent font-500 text-ink text-base mb-2 placeholder:text-ink-faint" />
      
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id}
            onClick={() => { setEditCategory(editCategory === id ? null : id); setEditFoodMeta({}) }}
            className={`btn-sm btn-on`}>
            {label}
          </button>
        ))}
      </div>

      {editCategory === 'food' && (
        <div className="mb-3"><FoodMetaFields value={editFoodMeta} onChange={setEditFoodMeta} /></div>
      )}

      <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus rows={4}
        className="w-full border border-paper-border rounded-sm px-3 py-2 font-light text-ink bg-paper-warm outline-none focus:border-ink/30 resize-none leading-[1.85] transition-colors" />

      <input type="text" placeholder="위치" value={editLocation}
        onChange={e => setEditLocation(e.target.value)} maxLength={60}
        className="mt-2 w-full text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30 transition-colors" />

      <ImageGallery imageIds={editImageIds} editable
        onRemove={id => setEditImageIds(prev => prev.filter(i => i !== id))} />
      <div className="mt-2">
        <ImageUploader entryId={entry.id} onUploaded={id => setEditImageIds(prev => [...prev, id])} />
      </div>

      <div className="flex flex-wrap gap-1.5 items-center mt-2">
        {editTags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-sm bg-ink/8 text-ink border border-ink/15">
            #{tag}
            <button onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="text-accent/60 hover:text-accent cursor-pointer">×</button>
          </span>
        ))}
        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown} placeholder="태그 추가"
          className="bg-transparent outline-none placeholder:text-ink-faint border-b border-paper-border focus:border-ink/30 py-0.5 min-w-[80px] transition-colors" />
      </div>

      <div className="flex gap-3 mt-3">
        <button onClick={saveEdit}
          className="text-sm bg-ink text-white px-3 py-1.5 rounded-sm hover:opacity-75 transition-colors cursor-pointer">저장</button>
        <button onClick={() => setEditing(false)}
          className="text-sm text-ink-faint border border-paper-border px-3 py-1.5 rounded-sm cursor-pointer">취소</button>
      </div>
    </div>
  )

  return (
    <div className="bg-paper-card border border-paper-border rounded-sm px-4 py-4 animate-fade-slide"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      {/* 제목 */}
      {entry.title && (
        <p className="font-500 text-base text-ink mb-2">{entry.title}</p>
      )}

      {/* 본문 */}
      <p className="font-light text-ink leading-[1.85] whitespace-pre-wrap break-words">{entry.text}</p>

      {/* 이미지 */}
      {entry.imageIds.length > 0 && (
        <div className="mt-3">
          <ImageGallery imageIds={entry.imageIds} />
        </div>
      )}

      {/* 공통 메타 + 카테고리 — 구분선 + 인라인 한 줄 */}
      <div className="mt-4 pt-3 border-t border-paper-border flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-sm text-ink-faint">⏱ {formatTime(entry.createdAt)}</span>
        {entry.location && (
          <span className="text-sm text-ink-faint">📍 {entry.location}</span>
        )}
        {categoryLabel && (
          <span className="text-sm text-ink-muted border border-paper-border rounded-sm px-1.5 py-0.5">{categoryLabel}</span>
        )}
        {food?.amount != null && (
          <span className="text-sm text-ink-faint">{formatAmount(food.amount)}</span>
        )}
        {food?.rating != null && (
          <span className="text-sm text-ink-faint">⭐ {formatRating(food.rating)}</span>
        )}
        {entry.tags.length > 0 && entry.tags.map(tag => (
          <button key={tag} onClick={() => onTagClick?.(tag)}
            className="text-xs text-ink-faint hover:text-ink transition-colors cursor-pointer bg-none border-none p-0">
            #{tag}
          </button>
        ))}
      </div>

      {/* 수정/삭제 */}
      <div className={`flex items-center gap-4 mt-3 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={startEdit}
          className="text-xs text-ink-faint hover:text-accent bg-none border-none p-0 cursor-pointer transition-colors">수정</button>
        <button onClick={() => onDelete(entry.id)}
          className="text-xs text-ink-faint hover:text-accent bg-none border-none p-0 cursor-pointer transition-colors">삭제</button>
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
