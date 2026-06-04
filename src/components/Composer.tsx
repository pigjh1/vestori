import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { CATEGORIES, type CategoryId } from '@/types'

const MAX_LENGTH = 500

interface ComposerProps {
  onSubmit: (text: string, category: CategoryId | null, tags: string[], createdAt: string) => void
}

export function Composer({ onSubmit }: ComposerProps) {
  const [text, setText] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [customTime, setCustomTime] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const addTag = useCallback(() => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags(prev => [...prev, t])
    }
    setTagInput('')
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }, [])

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    const createdAt = useCustomTime ? new Date(customTime).toISOString() : new Date().toISOString()
    onSubmit(trimmed, category, tags, createdAt)
    setText(''); setCategory(null); setTags([]); setTagInput('')
    setUseCustomTime(false)
    setCustomTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
    setShowOptions(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, category, tags, useCustomTime, customTime, onSubmit])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
    }, [handleSubmit]
  )

  const charCount = text.length
  const isOverLimit = charCount > MAX_LENGTH - 100
  const activeBadges = [
    category ? CATEGORIES.find(c => c.id === category)?.label : null,
    ...tags.map(t => `#${t}`),
    useCustomTime ? format(new Date(customTime), 'M/d HH:mm') : null,
  ].filter(Boolean)

  return (
    <div className="relative bg-white border border-paper-border rounded-sm shadow-sm mb-8 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-full bg-accent-pale border border-accent-light flex items-center justify-center font-serif text-[13px] italic text-accent flex-shrink-0">나</div>
          <span className="font-sans text-xs text-ink-faint font-light tracking-wide">오늘 어떤 흔적을 남기시겠어요?</span>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="지금 이 순간을 기록하세요..."
          maxLength={MAX_LENGTH}
          rows={3}
          className="w-full border-none outline-none bg-transparent font-body text-[15px] font-light text-ink leading-[1.75] resize-none min-h-[80px] placeholder:text-ink-faint placeholder:italic placeholder:font-light caret-accent"
        />

        {showOptions && (
          <div className="mt-3 mb-1 flex flex-col gap-3 pt-3 border-t border-paper-border">
            {/* 카테고리 */}
            <div className="flex items-start gap-2">
              <span className="font-sans text-[11px] text-ink-faint font-light w-14 flex-shrink-0 pt-1">카테고리</span>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(({ id, label }) => (
                  <button key={id} onClick={() => setCategory(category === id ? null : id)}
                    className={`font-sans text-[11px] px-2.5 py-1 rounded-sm border transition-all duration-150 cursor-pointer
                      ${category === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 태그 */}
            <div className="flex items-start gap-2">
              <span className="font-sans text-[11px] text-ink-faint font-light w-14 flex-shrink-0 pt-1">태그</span>
              <div className="flex flex-wrap gap-1.5 items-center flex-1">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 font-sans text-[11px] px-2 py-0.5 rounded-sm bg-accent-pale text-accent border border-accent/20">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="text-accent/60 hover:text-accent leading-none cursor-pointer">×</button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTag}
                  placeholder="태그 입력 후 Enter"
                  className="font-sans text-[11px] text-ink bg-transparent outline-none placeholder:text-ink-faint min-w-[100px] border-b border-paper-border focus:border-accent-light transition-colors py-0.5"
                />
              </div>
            </div>

            {/* 시간 */}
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] text-ink-faint font-light w-14 flex-shrink-0">시간</span>
              <button onClick={() => setUseCustomTime(v => !v)}
                className={`font-sans text-[11px] px-2.5 py-1 rounded-sm border transition-all duration-150 cursor-pointer
                  ${useCustomTime ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
                직접 입력
              </button>
              {useCustomTime && (
                <input type="datetime-local" value={customTime} onChange={e => setCustomTime(e.target.value)}
                  className="font-sans text-[11px] text-ink-muted border border-paper-border rounded-sm px-2 py-1 bg-paper-warm outline-none focus:border-accent-light transition-colors" />
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-paper-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-sans text-[11px] font-light transition-colors ${isOverLimit ? 'text-accent' : 'text-ink-faint'}`}>{charCount} / {MAX_LENGTH}</span>
            <button onClick={() => setShowOptions(v => !v)}
              className={`font-sans text-[11px] font-light border-none bg-none p-0 cursor-pointer transition-colors
                ${showOptions ? 'text-accent' : 'text-ink-faint hover:text-ink-muted'}`}>
              {showOptions ? '옵션 닫기' : '+ 옵션'}
            </button>
            {!showOptions && activeBadges.map((b, i) => (
              <span key={i} className="font-sans text-[10px] px-1.5 py-0.5 rounded-sm bg-accent-pale text-accent border border-accent/20">{b}</span>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={!text.trim()}
            className="bg-ink text-white rounded-sm px-[18px] py-[7px] font-sans text-xs tracking-[0.04em] transition-all duration-150 hover:bg-accent disabled:opacity-40 disabled:cursor-default active:scale-[0.97]">
            기록하기
          </button>
        </div>
      </div>
    </div>
  )
}
