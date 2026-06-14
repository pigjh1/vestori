import { useState, KeyboardEvent } from 'react'
import { todayKey, getDateKey, subDays, formatDateShort } from '@/utils/date'
import { useRoutine } from '@/hooks/useRoutine'

export function RoutinePage() {
  const today = todayKey()
  const todayLabel = formatDateShort(today)
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

  const handleDrop = (targetId: string) => {
    if (!dragging || dragging === targetId) return
    const fromIdx = habits.findIndex(h => h.id === dragging)
    const toIdx = habits.findIndex(h => h.id === targetId)
    if (fromIdx >= 0 && toIdx >= 0) reorder(fromIdx, toIdx)
    setDragging(null)
  }

  return (
    <div>
      <div className="bg-paper-card border border-paper-border rounded-sm p-4 mb-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-ink-faint mb-0.5">오늘</p>
            <p className="text-base text-ink">{todayLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xl text-ink leading-none">{doneCount}</p>
            <p className="text-xs text-ink-faint">/ {habits.length}개 완료</p>
          </div>
        </div>
        {habits.length > 0 && (
          <div className="h-1 bg-paper-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0 mb-4">
        {habits.length === 0 && !adding && (
          <div className="text-center py-12">
            <div className="text-5xl text-paper-border leading-none mb-4">○</div>
            <p className="text-sm font-light text-ink-faint leading-[1.7]">아직 루틴이 없어요.<br />아래 버튼으로 추가해보세요.</p>
          </div>
        )}

        {habits.map(habit => {
          const done = !!todayChecks[habit.id]
          return (
            <div key={habit.id}
              draggable
              onDragStart={() => setDragging(habit.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(habit.id)}
              onDragEnd={() => setDragging(null)}
              className={`flex items-center gap-3 px-1 py-3.5 border-b border-paper-border group transition-opacity cursor-grab active:cursor-grabbing ${dragging === habit.id ? 'opacity-40' : 'opacity-100'}`}>

              <div className="opacity-0 group-hover:opacity-30 transition-opacity flex-shrink-0">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <circle cx="4" cy="4" r="1.2" fill="currentColor"/><circle cx="8" cy="4" r="1.2" fill="currentColor"/>
                  <circle cx="4" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                  <circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="8" cy="12" r="1.2" fill="currentColor"/>
                </svg>
              </div>

              <button onClick={() => toggle(today, habit.id)}
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                  ${done ? 'bg-accent border-accent' : 'border-paper-border hover:border-ink/30 bg-transparent'}`}>
                {done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              <span className={`text-base font-light flex-1 transition-all ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>
                {habit.name}
              </span>

              {habit.streak > 0 && (
                <span className="text-xs text-ink-light opacity-0 group-hover:opacity-100 transition-opacity">
                  {habit.streak}일 연속
                </span>
              )}

              <button onClick={() => deleteHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-accent cursor-pointer bg-none border-none text-base flex-shrink-0">
                ×
              </button>
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className="flex items-center gap-2">
          <input autoFocus value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="루틴 이름 입력" maxLength={40}
            className="flex-1 font-light text-ink bg-paper-card border border-accent-light rounded-sm px-3 py-2 outline-none placeholder:text-ink-faint" />
          <button onClick={handleAdd} disabled={!newHabit.trim()}
            className="text-sm bg-ink text-white px-4 py-2 rounded-sm hover:opacity-75 transition-colors cursor-pointer disabled:opacity-40">추가</button>
          <button onClick={() => { setAdding(false); setNewHabit('') }}
            className="text-sm text-ink-faint border border-paper-border px-3 py-2 rounded-sm cursor-pointer">취소</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 border border-dashed border-paper-border rounded-sm text-sm text-ink-faint hover:text-ink hover:border-ink/30 transition-all cursor-pointer">
          + 루틴 추가
        </button>
      )}

      {Object.keys(checks).length > 1 && habits.length > 0 && (
        <WeekSummary habits={habits} checks={checks} />
      )}
    </div>
  )
}

function WeekSummary({ habits, checks }: { habits: { id: string }[], checks: Record<string, Record<string, boolean>> }) {
  const KO_DAYS = ['일','월','화','수','목','금','토']
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const key = getDateKey(d.toISOString())
    const dayChecks = checks[key] ?? {}
    const done = habits.filter(h => dayChecks[h.id]).length
    const rate = habits.length > 0 ? done / habits.length : 0
    return { key, label: KO_DAYS[d.getDay()], done, rate }
  })

  return (
    <div className="mt-8 pt-6 border-t border-paper-border">
      <p className="text-xs text-ink-faint tracking-wide mb-4">최근 7일</p>
      <div className="flex gap-2">
        {days.map(({ key, label, done, rate }) => (
          <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex flex-col justify-end" style={{ height: '40px' }}>
              <div className="w-full rounded-sm transition-all"
                style={{ height: rate > 0 ? `${Math.max(rate * 40, 4)}px` : '4px', background: rate === 0 ? 'var(--color-paper-border)' : 'var(--color-accent)', opacity: rate === 0 ? 1 : 0.4 + rate * 0.6 }} />
            </div>
            <span className="text-xs text-ink-faint">{label}</span>
            <span className="text-xs text-ink-faint">{done > 0 ? done : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
