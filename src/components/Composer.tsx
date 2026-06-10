import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { CATEGORIES, type CategoryId, type CategoryMeta, type FoodMeta } from '@/types'
import { ImageUploader } from './ImageUploader'
import { ImageGallery } from './ImageGallery'
import { FoodMetaFields } from './FoodMetaFields'
import { v4 as uuidv4 } from 'uuid'
import { pad } from '@/utils/date'

const MAX_LENGTH = 500

function defaultDate() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function defaultTime() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ComposerProps {
  onSubmit: (
    title: string, text: string, category: CategoryId | null, categoryMeta: CategoryMeta,
    tags: string[], imageIds: string[], location: string, createdAt: string
  ) => void
}

export function Composer({ onSubmit }: ComposerProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [foodMeta, setFoodMeta] = useState<Partial<FoodMeta>>({})
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [imageIds, setImageIds] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [locating, setLocating] = useState(false)
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [customDate, setCustomDate] = useState(defaultDate)
  const [customTime, setCustomTime] = useState(defaultTime)
  const [composerEntryId] = useState(() => uuidv4())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`)
          .then(r => r.json())
          .then(data => {
            const a = data.address
            setLocation(a.restaurant ?? a.cafe ?? a.shop ?? a.road ?? a.neighbourhood ?? a.suburb ?? a.city ?? `${lat.toFixed(4)},${lng.toFixed(4)}`)
          })
          .catch(() => setLocation(`${lat.toFixed(4)},${lng.toFixed(4)}`))
          .finally(() => setLocating(false))
      },
      () => setLocating(false)
    )
  }

  const addTag = useCallback(() => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t) && tags.length < 10) setTags(prev => [...prev, t])
    setTagInput('')
  }, [tagInput, tags])

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags(prev => prev.slice(0, -1))
  }

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmedText = text.trim()
    if (!trimmedText) return
    let createdAt: string
    if (useCustomTime) {
      createdAt = new Date(`${customDate}T${customTime}:00`).toISOString()
    } else {
      createdAt = new Date().toISOString()
    }
    const meta: CategoryMeta = category === 'food' ? { food: foodMeta } : {}
    onSubmit(title, trimmedText, category, meta, tags, imageIds, location, createdAt)
    // 초기화
    setTitle(''); setText(''); setCategory(null); setFoodMeta({}); setTags([]); setTagInput('')
    setImageIds([]); setLocation(''); setUseCustomTime(false)
    setCustomDate(defaultDate()); setCustomTime(defaultTime())
    setShowOptions(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [title, text, category, foodMeta, tags, imageIds, location, useCustomTime, customDate, customTime, onSubmit])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
    }, [handleSubmit]
  )

  const charCount = text.length
  const isOverLimit = charCount > MAX_LENGTH - 100

  const activeBadges = [
    category ? CATEGORIES.find(c => c.id === category)?.label : null,
    location ? `📍 ${location}` : null,
    ...tags.map(t => `#${t}`),
    useCustomTime ? `${customDate} ${customTime}` : null,
    imageIds.length > 0 ? `사진 ${imageIds.length}장` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="relative bg-paper-card border border-paper-border rounded-sm shadow-sm mb-6 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
      <div className="px-4 pt-4 pb-3">
        <textarea ref={textareaRef} value={text} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder="지금 이 순간을 기록하세요..."
          maxLength={MAX_LENGTH} rows={3}
          className="w-full border-none outline-none bg-transparent font-light text-ink leading-[1.75] resize-none min-h-[72px] placeholder:text-ink-faint placeholder:italic placeholder:font-light" />

        {imageIds.length > 0 && (
          <ImageGallery imageIds={imageIds} editable onRemove={id => setImageIds(prev => prev.filter(i => i !== id))} />
        )}

        {showOptions && (
          <div className="mt-3 flex flex-col gap-3.5 pt-3 border-t border-paper-border">

            {/* 공통 요소: 위치, 태그, 사진, 시간 */}
            {/* 위치 */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-ink-faint w-14 flex-shrink-0">위치</span>
              <div className="flex gap-1.5 flex-1 min-w-0">
                <input type="text" placeholder="위치" maxLength={60}
                  value={location} onChange={e => setLocation(e.target.value)}
                  className="flex-1 min-w-0 text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30 transition-colors" />
                <button type="button" onClick={getLocation} disabled={locating} title="현재 위치"
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm border transition-all cursor-pointer
                    ${locating ? 'border-paper-border text-ink-faint' : 'border-ink/30 text-ink hover:opacity-75-pale'}`}>
                  {locating ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                      <line x1="7" y1="1" x2="7" y2="3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <line x1="7" y1="10.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <line x1="1" y1="7" x2="3.5" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <line x1="10.5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 태그 */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-ink-faint w-14 flex-shrink-0 pt-1">태그</span>
              <div className="flex flex-wrap gap-1.5 items-center flex-1">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-sm bg-ink/8 text-ink border border-ink/15">
                    #{tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-accent/60 hover:text-accent cursor-pointer">×</button>
                  </span>
                ))}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown} placeholder="태그 입력 후 Enter"
                  className="text-ink bg-transparent outline-none placeholder:text-ink-faint border-b border-paper-border focus:border-ink/30 py-0.5 min-w-[100px] transition-colors" />
              </div>
            </div>

            {/* 사진 */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-ink-faint w-14 flex-shrink-0 pt-1">사진</span>
              <div className="flex-1">
                <ImageUploader entryId={composerEntryId} onUploaded={id => setImageIds(prev => [...prev, id])} />
              </div>
            </div>

            {/* 시간 */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-ink-faint w-14 flex-shrink-0 pt-1">시간</span>
              <div className="flex flex-col gap-2 flex-1">
                <button onClick={() => setUseCustomTime(v => !v)}
                  className={`btn-sm btn-on`}>
                  직접 입력
                </button>
                {useCustomTime && (
                  <div className="flex gap-2">
                    <input type="date" value={customDate}
                      onChange={e => setCustomDate(e.target.value)}
                      className="flex-1 text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30 transition-colors" />
                    <input type="time" value={customTime}
                      onChange={e => setCustomTime(e.target.value)}
                      className="w-28 text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30 transition-colors" />
                  </div>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div className="h-px bg-paper-border" />

            {/* 카테고리 */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-ink-faint w-14 flex-shrink-0 pt-1">카테고리</span>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(({ id, label }) => (
                  <button key={id}
                    onClick={() => { setCategory(category === id ? null : id); setFoodMeta({}); if (category === id) setTitle('') }}
                    className={`btn-sm btn-on`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 - 카테고리 선택 시에만 표시 */}
            {category && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-ink-faint w-14 flex-shrink-0 pt-1">제목</span>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="제목" maxLength={40}
                  className="flex-1 text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30 transition-colors" />
              </div>
            )}

            {/* 음식/쇼핑 금액 필드 */}
            {(category === 'food' || category === 'shopping') && <FoodMetaFields value={foodMeta} onChange={setFoodMeta} />}

          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-paper-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs transition-colors ${isOverLimit ? 'text-accent' : 'text-ink-faint'}`}>
              {charCount} / {MAX_LENGTH}
            </span>
            <button onClick={() => setShowOptions(v => !v)}
              className={`text-xs border-none bg-none p-0 cursor-pointer transition-colors
                ${showOptions ? 'text-accent' : 'text-ink-faint hover:text-ink-muted'}`}>
              {showOptions ? '옵션 닫기' : '+ 옵션'}
            </button>
            {!showOptions && activeBadges.map((b, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 rounded-sm bg-ink/8 text-ink border border-ink/15">{b}</span>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={!text.trim()}
            className="bg-ink text-white rounded-sm px-4 py-1.5 text-sm transition-all hover:opacity-75 disabled:opacity-40 disabled:cursor-default active:scale-[0.97]">
            기록하기
          </button>
        </div>
      </div>
    </div>
  )
}
