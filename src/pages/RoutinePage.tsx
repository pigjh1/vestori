import { useState, KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import { useRoutine } from '@/hooks/useRoutine'

export function RoutinePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLabel = format(new Date(), 'M월 d일 (E)', { locale: ko })

  const { habits, checks, addHabit, deleteHabit, toggle, reorder } = useRoutine()

  const [newHabit, setNewHabit] = useState('')
  const [adding, setAdding] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  const handleAdd = () => {
    const name = newHabit.trim()
    if (!name) return
    addHabit(name)
    setNewHabit('')
    setAdding(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setAdding(false); setNewHabit('') }
  }

  const todayChecks = checks[today] ?? {}
  const doneCount = habits.filter(h => todayChecks[h.id]).length
  const progress = habits.length > 0 ? doneCount / habits.length : 0

  // drag-and-drop 순서 변경
  const handleDragStart = (id: string) => setDragging(id)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!dragging || dragging === targetId) return
  }
  const handleDrop = (targetId: string) => {
    if (!dragging || dragging === targetId) return
    const fromIdx = habits.findIndex(h => h.id === dragging)
    const toIdx   = habits.findIndex(h => h.id === targetId)
    if (fromIdx < 0 || toIdx < 0) return
    reorder(fromIdx, toIdx)
    setDragging(null)
  }

  return (
    <div className="max-w-lg">
      {/* 오늘 날짜 + 진행 */}
      <div className="bg-white border border-paper-border rounded-sm p-5 mb-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-sans text-[11px] text-ink-faint font-light mb-0.5">오늘</p>
            <p className="font-serif text-[15px] italic text-ink">{todayLabel}</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-[28px] italic text-accent leading-none">{doneCount}</p>
            <p className="font-sans text-[11px] text-ink-faint font-light">/ {habits.length}개 완료</p>
          </div>
        </div>

        {/* 진행 바 */}
        {habits.length > 0 && (
          <div className="h-1 bg-paper-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      {/* 체크리스트 */}
      <div className="flex flex-col gap-0 mb-4">
        {habits.length === 0 && !adding && (
          <div className="text-center py-12">
            <div className="font-serif text-5xl italic text-paper-border leading-none mb-4">○</div>
            <p className="font-body text-sm font-light text-ink-faint italic leading-[1.7]">
              아직 루틴이 없어요.<br />아래 버튼으로 첫 번째 루틴을 추가해보세요.
            </p>
          </div>
        )}

        {habits.map((habit) => {
          const done = !!todayChecks[habit.id]
          return (
            <div key={habit.id}
              draggable
              onDragStart={() => handleDragStart(habit.id)}
              onDragOver={e => handleDragOver(e, habit.id)}
              onDrop={() => handleDrop(habit.id)}
              onDragEnd={() => setDragging(null)}
              className={`flex items-center gap-3 px-1 py-3.5 border-b border-paper-border
                group transition-opacity cursor-grab active:cursor-grabbing
                ${dragging === habit.id ? 'opacity-40' : 'opacity-100'}`}>

              {/* 드래그 핸들 */}
              <div className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 cursor-grab">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <circle cx="4" cy="4" r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="4" r="1.2" fill="currentColor"/>
                  <circle cx="4" cy="8" r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                  <circle cx="4" cy="12" r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="12" r="1.2" fill="currentColor"/>
                </svg>
              </div>

              {/* 체크박스 */}
              <button onClick={() => toggle(today, habit.id)}
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0
                  transition-all duration-200 cursor-pointer
                  ${done
                    ? 'bg-accent border-accent'
                    : 'border-paper-border hover:border-accent-light bg-transparent'}`}>
                {done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* 이름 */}
              <span className={`font-body text-[15px] font-light flex-1 transition-all duration-200
                ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>
                {habit.name}
              </span>

              {/* 연속 스트릭 */}
              {habit.streak > 0 && (
                <span className="font-sans text-[10px] text-accent-light font-light opacity-0 group-hover:opacity-100 transition-opacity">
                  {habit.streak}일 연속
                </span>
              )}

              {/* 삭제 */}
              <button onClick={() => deleteHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint
                  hover:text-accent cursor-pointer bg-none border-none font-sans text-[13px] flex-shrink-0">
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* 새 루틴 입력 */}
      {adding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="루틴 이름 입력..."
            maxLength={40}
            className="flex-1 font-body font-light text-ink bg-white border border-accent-light rounded-sm px-3 py-2 outline-none placeholder:text-ink-faint"
          />
          <button onClick={handleAdd}
            disabled={!newHabit.trim()}
            className="font-sans text-[12px] bg-ink text-white px-4 py-2 rounded-sm hover:bg-accent transition-colors cursor-pointer disabled:opacity-40">
            추가
          </button>
          <button onClick={() => { setAdding(false); setNewHabit('') }}
            className="font-sans text-[12px] text-ink-faint hover:text-ink border border-paper-border px-3 py-2 rounded-sm transition-colors cursor-pointer">
            취소
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 border border-dashed border-paper-border rounded-sm
            font-sans text-[12px] text-ink-faint hover:text-ink hover:border-accent-light
            transition-all cursor-pointer bg-none">
          + 루틴 추가
        </button>
      )}

      {/* 전체 달성률 (기록이 있을 때만) */}
      {Object.keys(checks).length > 1 && habits.length > 0 && (
        <WeekSummary habits={habits} checks={checks} />
      )}
    </div>
  )
}

// ── 최근 7일 요약 ────────────────────────
function WeekSummary({ habits, checks }: {
  habits: { id: string; name: string; streak: number }[]
  checks: Record<string, Record<string, boolean>>
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = format(d, 'yyyy-MM-dd')
    const label = format(d, 'EEE', { locale: ko })
    const dayChecks = checks[key] ?? {}
    const done = habits.filter(h => dayChecks[h.id]).length
    const rate = habits.length > 0 ? done / habits.length : 0
    return { key, label, done, rate }
  })

  return (
    <div className="mt-8 pt-6 border-t border-paper-border">
      <p className="font-sans text-[11px] text-ink-faint font-light tracking-wide mb-4">최근 7일</p>
      <div className="flex gap-2">
        {days.map(({ key, label, done, rate }) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex flex-col justify-end" style={{ height: '40px' }}>
              <div className="w-full rounded-sm transition-all duration-300"
                style={{
                  height: rate > 0 ? `${Math.max(rate * 40, 4)}px` : '4px',
                  background: rate === 0 ? 'var(--color-paper-border)' : 'var(--color-accent)',
                  opacity: rate === 0 ? 1 : 0.4 + rate * 0.6,
                }} />
            </div>
            <span className="font-sans text-[10px] text-ink-faint">{label}</span>
            <span className="font-sans text-[10px] text-ink-faint">{done > 0 ? done : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
