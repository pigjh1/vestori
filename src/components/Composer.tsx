import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import type { Mood } from '@/types'

const MOODS: { symbol: Mood; label: string }[] = [
  { symbol: '✦', label: '평온' },
  { symbol: '♡', label: '따뜻함' },
  { symbol: '◎', label: '집중' },
  { symbol: '☁', label: '흐림' },
  { symbol: '✿', label: '기쁨' },
]

const MAX_LENGTH = 500

interface ComposerProps {
  onSubmit: (text: string, mood: Mood) => void
}

export function Composer({ onSubmit }: ComposerProps) {
  const [text, setText] = useState('')
  const [mood, setMood] = useState<Mood>('✦')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed, mood)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, mood, onSubmit])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const charCount = text.length
  const isOverLimit = charCount > MAX_LENGTH - 100

  return (
    <div className="relative bg-white border border-paper-border rounded-sm shadow-sm mb-12 overflow-hidden">
      {/* accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />

      <div className="px-6 pt-5 pb-4">
        {/* header */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-full bg-accent-pale border border-accent-light flex items-center justify-center font-serif text-[13px] italic text-accent flex-shrink-0">
            나
          </div>
          <span className="font-sans text-xs text-ink-faint font-light tracking-wide">
            오늘 어떤 흔적을 남기시겠어요?
          </span>
        </div>

        {/* textarea */}
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

        {/* footer */}
        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-paper-border">
          <span
            className={`font-sans text-[11px] font-light transition-colors ${
              isOverLimit ? 'text-accent' : 'text-ink-faint'
            }`}
          >
            {charCount} / {MAX_LENGTH}
          </span>

          <div className="flex items-center gap-3">
            {/* mood picker */}
            <div className="flex gap-1.5" role="group" aria-label="기분 선택">
              {MOODS.map(({ symbol, label }) => (
                <button
                  key={symbol}
                  title={label}
                  aria-label={label}
                  aria-pressed={mood === symbol}
                  onClick={() => setMood(symbol)}
                  className={`w-[26px] h-[26px] rounded-full border text-[13px] flex items-center justify-center transition-all duration-150
                    ${
                      mood === symbol
                        ? 'border-accent bg-accent-pale opacity-100 scale-110'
                        : 'border-paper-border opacity-60 hover:opacity-100 hover:border-accent-light hover:scale-110'
                    }`}
                >
                  {symbol}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="bg-ink text-white rounded-sm px-[18px] py-[7px] font-sans text-xs tracking-[0.04em] transition-all duration-150
                hover:bg-accent disabled:opacity-40 disabled:cursor-default active:scale-[0.97]"
            >
              기록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
