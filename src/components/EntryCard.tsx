import { useState } from 'react'
import type { Entry } from '@/types'
import { formatTime } from '@/utils/date'

interface EntryCardProps {
  entry: Entry
  onLike: (id: string) => void
  onDelete: (id: string) => void
}

export function EntryCard({ entry, onLike, onDelete }: EntryCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="py-6 border-b border-paper-border animate-fade-slide"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm leading-none">{entry.mood}</span>
        <span className="font-sans text-[11px] font-light text-ink-faint tracking-wide">
          {formatTime(entry.createdAt)}
        </span>
      </div>

      <p className="font-body text-[15px] font-light text-ink leading-[1.85] whitespace-pre-wrap break-words">
        {entry.text}
      </p>

      <div
        className={`flex items-center gap-4 mt-3 transition-opacity duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => onLike(entry.id)}
          className={`font-sans text-[11px] font-light tracking-wide transition-colors bg-none border-none p-0 cursor-pointer
            ${entry.liked ? 'text-accent' : 'text-ink-faint hover:text-accent'}`}
        >
          {entry.liked ? '♥ 마음에 담음' : '♡ 마음에 담기'}
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="font-sans text-[11px] font-light text-ink-faint hover:text-accent tracking-wide bg-none border-none p-0 cursor-pointer transition-colors"
        >
          지우기
        </button>
      </div>
    </div>
  )
}
