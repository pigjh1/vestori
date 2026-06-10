import { useState } from 'react'
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

interface AddModalProps {
  meal: MealType
  onSave: (item: Omit<DietItem, 'id'>) => void
  onClose: () => void
}

function AddModal({ meal, onSave, onClose }: AddModalProps) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [amount, setAmount] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      calories: calories ? Number(calories) : null,
      amount: amount.trim(),
    })
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
              className="w-full border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-ink-muted">칼로리 (kcal)</label>
              <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
                placeholder="예: 350"
                className="w-full border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-ink-muted">양</label>
              <input type="text" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="예: 1인분, 200g"
                className="w-full border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
            </div>
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
  const { getDay, addItem, removeItem, totalCalories } = useDiet()
  const today = todayKey()
  const [dateKey, setDateKey] = useState(today)
  const [addingMeal, setAddingMeal] = useState<MealType | null>(null)

  const day = getDay(dateKey)
  const total = totalCalories(dateKey)
  const isToday = dateKey === today
  const isFuture = dateKey > today

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-xl text-ink" style={{ fontStyle: 'italic' }}>식단</span>
        <div className="flex-1 h-px bg-paper-border" />
        {total != null && (
          <span className="text-sm text-ink-muted">
            총 <span className="text-ink">{total.toLocaleString()}</span> kcal
          </span>
        )}
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setDateKey(prevDay(dateKey))}
          className="btn-sm btn-off w-8 h-8 flex items-center justify-center p-0">‹</button>
        <div className="flex-1 text-center">
          <p className="text-base text-ink">{formatDate(dateKey)}</p>
          {isToday && <p className="text-sm text-ink-muted">오늘</p>}
        </div>
        <button onClick={() => setDateKey(nextDay(dateKey))} disabled={isToday}
          className={`btn-sm ${isToday ? 'btn-off opacity-30 cursor-not-allowed' : 'btn-off'} w-8 h-8 flex items-center justify-center p-0`}>›</button>
      </div>

      {/* 식사 섹션 */}
      <div className="flex flex-col gap-4">
        {MEAL_ORDER.map(meal => {
          const items = day[meal]
          const mealCal = items.reduce((s, i) => s + (i.calories ?? 0), 0)
          const hasCal = items.some(i => i.calories != null)

          return (
            <div key={meal} className="border border-paper-border rounded-sm overflow-hidden">
              {/* 식사 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 bg-paper-warm">
                <div className="flex items-center gap-2">
                  <span className="text-base text-ink">{MEAL_LABELS[meal]}</span>
                  {hasCal && <span className="text-sm text-ink-muted">{mealCal} kcal</span>}
                </div>
                {!isFuture && (
                  <button onClick={() => setAddingMeal(meal)}
                    className="w-7 h-7 flex items-center justify-center rounded-sm border border-paper-border text-ink-muted hover:text-ink hover:border-ink/30 transition-colors cursor-pointer text-lg leading-none">
                    +
                  </button>
                )}
              </div>

              {/* 음식 목록 */}
              {items.length > 0 ? (
                <div className="divide-y divide-paper-border">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 group">
                      <div className="flex-1 min-w-0">
                        <span className="text-base text-ink">{item.name}</span>
                        {item.amount && (
                          <span className="text-sm text-ink-faint ml-2">{item.amount}</span>
                        )}
                      </div>
                      {item.calories != null && (
                        <span className="text-sm text-ink-muted flex-shrink-0">{item.calories} kcal</span>
                      )}
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

      {/* 입력 모달 */}
      {addingMeal && (
        <AddModal
          meal={addingMeal}
          onSave={item => addItem(dateKey, addingMeal, item)}
          onClose={() => setAddingMeal(null)}
        />
      )}
    </div>
  )
}
