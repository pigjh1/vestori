import { useState, useRef, useEffect } from 'react'
import { useDiet, MEAL_LABELS, MEAL_ORDER, type MealType, type DietItem } from '@/hooks/useDiet'
import { getDateKey, pad } from '@/utils/date'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDate(dateKey: string) {
  const [y, m, d] = dateKey.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  const days = ['일','월','화','수','목','금','토']
  return `${Number(m)}월 ${Number(d)}일 ${days[date.getDay()]}요일`
}

function prevDay(dateKey: string): string {
  const d = new Date(dateKey)
  d.setDate(d.getDate() - 1)
  return getDateKey(d.toISOString())
}
function nextDay(dateKey: string): string {
  const d = new Date(dateKey)
  d.setDate(d.getDate() + 1)
  return getDateKey(d.toISOString())
}

// 인라인 이름 편집 컴포넌트
function EditableName({ item, onUpdate }: { item: DietItem; onUpdate: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(item.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== item.name) onUpdate(trimmed)
    else setValue(item.name)
    setEditing(false)
  }

  if (editing) return (
    <input ref={inputRef} value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setValue(item.name); setEditing(false) } }}
      className="flex-1 bg-transparent border-b border-ink/30 outline-none text-base text-ink px-0 py-0" />
  )

  return (
    <span className="flex-1 text-base text-ink cursor-text hover:underline decoration-ink-faint underline-offset-2 transition-all"
      onClick={() => setEditing(true)} title="클릭해서 수정">
      {item.name}
    </span>
  )
}

// 음식 추가 모달
function AddModal({ meal, onSave, onClose }: {
  meal: MealType
  onSave: (item: Omit<DietItem, 'id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), amount: amount.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-paper border border-paper-border rounded-sm w-full max-w-sm shadow-xl z-10">
        <div className="px-5 pt-5 pb-6 flex flex-col gap-4">
          <p className="text-base text-ink">{MEAL_LABELS[meal]}에 추가</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">음식 이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="예: 된장찌개, 닭가슴살" autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">양 (선택)</label>
            <input type="text" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="예: 1인분, 200g"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!name.trim()} className="btn-primary flex-1">추가</button>
            <button onClick={onClose} className="btn-sm btn-off">취소</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DietPage() {
  const { getDay, addItem, updateItem, removeItem, reorderItem } = useDiet()
  const today = todayKey()
  const [dateKey, setDateKey] = useState(today)
  const [addingMeal, setAddingMeal] = useState<MealType | null>(null)

  const day = getDay(dateKey)
  const isToday = dateKey === today

  return (
    <div>
      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setDateKey(prevDay(dateKey))}
          className="btn-sm btn-off w-8 h-8 flex items-center justify-center p-0">‹</button>
        <div className="flex-1 text-center">
          <p className="text-base text-ink">{formatDate(dateKey)}</p>
          {isToday && <p className="text-sm text-ink-faint">오늘</p>}
        </div>
        <button onClick={() => setDateKey(nextDay(dateKey))} disabled={isToday}
          className={`btn-sm ${isToday ? 'btn-off opacity-30 cursor-not-allowed' : 'btn-off'} w-8 h-8 flex items-center justify-center p-0`}>›</button>
      </div>

      {/* 식사 섹션 */}
      <div className="flex flex-col gap-4">
        {MEAL_ORDER.map(meal => {
          const items = day[meal]
          return (
            <div key={meal} className="border border-paper-border rounded-sm overflow-hidden">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 bg-paper-warm">
                <span className="text-base text-ink">{MEAL_LABELS[meal]}</span>
                <button onClick={() => setAddingMeal(meal)}
                  className="w-7 h-7 flex items-center justify-center rounded-sm border border-paper-border text-ink-faint hover:text-ink hover:border-ink/30 transition-colors cursor-pointer text-lg leading-none">
                  +
                </button>
              </div>

              {/* 항목 */}
              {items.length > 0 ? (
                <div className="divide-y divide-paper-border">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 group">
                      {/* 순서 이동 */}
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => reorderItem(dateKey, meal, item.id, 'up')} disabled={idx === 0}
                          className="text-xs text-ink-faint hover:text-ink disabled:opacity-20 cursor-pointer border-none bg-none p-0 leading-none">▲</button>
                        <button onClick={() => reorderItem(dateKey, meal, item.id, 'down')} disabled={idx === items.length - 1}
                          className="text-xs text-ink-faint hover:text-ink disabled:opacity-20 cursor-pointer border-none bg-none p-0 leading-none">▼</button>
                      </div>

                      {/* 이름 (클릭 시 인라인 편집) */}
                      <EditableName item={item} onUpdate={name => updateItem(dateKey, meal, item.id, name)} />

                      {item.amount && <span className="text-sm text-ink-faint flex-shrink-0">{item.amount}</span>}

                      {/* 삭제 */}
                      <button onClick={() => removeItem(dateKey, meal, item.id)}
                        className="text-sm text-ink-faint hover:text-ink opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none bg-none p-0 flex-shrink-0">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-sm text-ink-faint italic">기록 없음</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {addingMeal && (
        <AddModal meal={addingMeal}
          onSave={item => addItem(dateKey, addingMeal, item)}
          onClose={() => setAddingMeal(null)} />
      )}
    </div>
  )
}
