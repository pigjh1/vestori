import { useState, KeyboardEvent } from 'react'
import type { ThreadPost } from '@/types'
import { formatTime, formatDateLabel, getDateKey, todayKey } from '@/utils/date'
import { ImageUploader } from './ImageUploader'
import { ImageGallery } from './ImageGallery'
import { v4 as uuidv4 } from 'uuid'

interface ThreadViewProps {
  entryId: string
  posts: ThreadPost[]
  onAdd: (entryId: string, text: string, imageIds: string[]) => void
  onDelete: (id: string) => void
}

function formatPostTime(iso: string): string {
  const dateKey = getDateKey(iso)
  const time = formatTime(iso)
  if (dateKey === todayKey()) return time
  return `${formatDateLabel(iso)} ${time}`
}

export function ThreadView({ entryId, posts, onAdd, onDelete }: ThreadViewProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [imageIds, setImageIds] = useState<string[]>([])
  const [composerId] = useState(() => uuidv4())

  const handleAdd = () => {
    const t = text.trim()
    if (!t && imageIds.length === 0) return
    onAdd(entryId, t, imageIds)
    setText('')
    setImageIds([])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAdd()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="mt-2.5 text-sm text-ink-faint hover:text-accent transition-colors cursor-pointer bg-none border-none p-0 flex items-center gap-1.5">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M1 1h11v8H7.5L5 11.5V9H1V1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
      {posts.length > 0 ? `타래 ${posts.length}개` : '타래 달기'}
    </button>
  )

  return (
    <div className="mt-3">
      {/* 타래 목록 */}
      {posts.length > 0 && (
        <div className="mb-3">
          {posts.map((post) => (
            <div key={post.id} className="flex gap-3 group">
              {/* 세로 연결선 */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: '2px' }}>
                <div className="w-0.5 bg-paper-border flex-1 mt-1" style={{ minHeight: '100%' }} />
              </div>

              {/* 포스트 내용 */}
              <div className="flex-1 pb-3 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-ink-faint">{formatPostTime(post.createdAt)}</span>
                  <button
                    onClick={() => onDelete(post.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-ink-faint hover:text-accent cursor-pointer bg-none border-none p-0 ml-auto">
                    삭제
                  </button>
                </div>
                {post.text && (
                  <p className="text-sm font-light text-ink leading-[1.7] whitespace-pre-wrap break-words">
                    {post.text}
                  </p>
                )}
                {(post.imageIds ?? []).length > 0 && (
                  <div className="mt-2">
                    <ImageGallery imageIds={post.imageIds} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 타래 입력 */}
      <div className="flex gap-3">
        {/* 연결선과 이어지는 점 */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: '2px' }}>
          <div className="w-2 h-2 rounded-full border-2 border-accent-light bg-paper mt-1 flex-shrink-0" />
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            autoFocus
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이어서 기록하기..."
            rows={2}
            maxLength={500}
            className="w-full font-light text-ink bg-transparent border-b border-paper-border outline-none focus:border-ink/30 resize-none placeholder:text-ink-faint transition-colors pb-1"
          />

          {imageIds.length > 0 && (
            <div className="mt-1">
              <ImageGallery imageIds={imageIds} editable onRemove={id => setImageIds(prev => prev.filter(i => i !== id))} />
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {/* 이미지 첨부 */}
            <div className="flex-shrink-0">
              <ImageUploader
                entryId={`thread-${composerId}`}
                onUploaded={id => setImageIds(prev => [...prev, id])}
                compact
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => { setOpen(false); setText(''); setImageIds([]) }}
                className="text-xs text-ink-faint hover:text-ink border border-paper-border px-2.5 py-1 rounded-sm cursor-pointer transition-colors">
                닫기
              </button>
              <button onClick={handleAdd} disabled={!text.trim() && imageIds.length === 0}
                className="text-xs bg-ink text-white px-3 py-1 rounded-sm hover:opacity-75 transition-colors cursor-pointer disabled:opacity-40">
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
