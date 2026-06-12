import { useState, useEffect } from 'react'
import { useRetrospect, type WeeklyRetro, type MonthlyRetro } from '@/hooks/useRetrospect'
import { pad } from '@/utils/date'

function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${date.getFullYear()}-W${pad(weekNum)}`
}

function getWeekLabel(weekKey: string): string {
  const [year, wPart] = weekKey.split('-W')
  const weekNum = parseInt(wPart)
  const jan1 = new Date(parseInt(year), 0, 1)
  const monday = new Date(jan1.getTime() + (weekNum - 1) * 7 * 86400000)
  const sunday = new Date(monday.getTime() + 6 * 86400000)
  return `${monday.getMonth() + 1}/${monday.getDate()} — ${sunday.getMonth() + 1}/${sunday.getDate()}`
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}`
}

const KO_MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function Field({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-ink-muted font-500">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="w-full text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30 transition-colors resize-none leading-relaxed placeholder:text-ink-faint placeholder:italic" />
    </div>
  )
}

function NavRow({ label, onPrev, onNext, disableNext }: {
  label: string; onPrev: () => void; onNext: () => void; disableNext: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center border border-paper-border rounded-sm text-ink-faint hover:border-ink/30 cursor-pointer transition-colors">‹</button>
      <span className="italic text-sm text-ink flex-1 text-center">{label}</span>
      <button onClick={onNext} disabled={disableNext}
        className={`w-7 h-7 flex items-center justify-center border rounded-sm transition-colors cursor-pointer
          ${disableNext ? 'border-paper-border text-ink-faint/30 cursor-not-allowed' : 'border-paper-border text-ink-faint hover:border-ink/30'}`}>›</button>
    </div>
  )
}

export function RetrospectPage() {
  const { retros, saveWeekly, saveMonthly } = useRetrospect()
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly')
  const [saved, setSaved] = useState(false)

  const now = new Date()
  const [weekKey, setWeekKey] = useState(getWeekKey(now))
  const [monthYear, setMonthYear] = useState(now.getFullYear())
  const [monthMonth, setMonthMonth] = useState(now.getMonth())
  const monthKey = getMonthKey(monthYear, monthMonth)

  // 주간 상태
  const EMPTY_WEEKLY = { wins: '', learnings: '', challenges: '', next_focus: '', energy: '' }
  const [weekly, setWeekly] = useState<Omit<WeeklyRetro, 'type' | 'weekKey' | 'updatedAt'>>(EMPTY_WEEKLY)

  // 월간 상태
  const EMPTY_MONTHLY = { achievements_work: '', achievements_personal: '', improvements: '', ideas: '', actions: '', others: '' }
  const [monthly, setMonthly] = useState<Omit<MonthlyRetro, 'type' | 'monthKey' | 'updatedAt'>>(EMPTY_MONTHLY)

  // 주간회고 로드
  useEffect(() => {
    const r = retros[weekKey]
    if (r?.type === 'weekly') {
      setWeekly({ wins: r.wins, learnings: r.learnings, challenges: r.challenges, next_focus: r.next_focus, energy: r.energy })
    } else setWeekly(EMPTY_WEEKLY)
  }, [weekKey, retros])

  // 월간회고 로드
  useEffect(() => {
    const r = retros[monthKey]
    if (r?.type === 'monthly') {
      setMonthly({ achievements_work: r.achievements_work, achievements_personal: r.achievements_personal, improvements: r.improvements, ideas: r.ideas, actions: r.actions, others: r.others })
    } else setMonthly(EMPTY_MONTHLY)
  }, [monthKey, retros])

  const handleSave = () => {
    if (tab === 'weekly') saveWeekly(weekKey, weekly)
    else saveMonthly(monthKey, monthly)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const prevWeek = () => {
    const [year, wPart] = weekKey.split('-W')
    const w = parseInt(wPart)
    setWeekKey(w > 1 ? `${year}-W${pad(w - 1)}` : `${parseInt(year) - 1}-W52`)
  }
  const nextWeek = () => {
    const [year, wPart] = weekKey.split('-W')
    const w = parseInt(wPart)
    setWeekKey(w < 52 ? `${year}-W${pad(w + 1)}` : `${parseInt(year) + 1}-W01`)
  }

  const prevMonth = () => {
    if (monthMonth === 0) { setMonthYear(y => y - 1); setMonthMonth(11) }
    else setMonthMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (monthMonth === 11) { setMonthYear(y => y + 1); setMonthMonth(0) }
    else setMonthMonth(m => m + 1)
  }

  const savedKeys = Object.keys(retros).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      {/* 저장 카운트 */}
      {savedKeys.length > 0 && (
        <p className="text-sm text-ink-faint mb-4">{savedKeys.length}개 저장됨</p>
      )}

      {/* 탭 */}
      <div className="tab-bar mb-6">
        {(['weekly', 'monthly'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab flex-1 text-center ${tab === t ? 'tab-on' : 'tab-off'}`}>
            {t === 'weekly' ? '주간' : '월간'}
          </button>
        ))}
      </div>

      {/* 주간회고 */}
      {tab === 'weekly' && (
        <div className="flex flex-col gap-5">
          <NavRow label={`${getWeekLabel(weekKey)} (${weekKey})`}
            onPrev={prevWeek} onNext={nextWeek} disableNext={weekKey >= getWeekKey(now)} />

          <Field label="✅ 이번 주 잘한 것" value={weekly.wins}
            onChange={v => setWeekly(p => ({ ...p, wins: v }))}
            placeholder="작은 것도 좋아요. 이번 주 나를 칭찬해주세요..." />

          <Field label="📚 배운 것" value={weekly.learnings}
            onChange={v => setWeekly(p => ({ ...p, learnings: v }))}
            placeholder="새로 알게 된 것, 깨달은 것을 적어보세요..." />

          <Field label="😤 힘들었던 것" value={weekly.challenges}
            onChange={v => setWeekly(p => ({ ...p, challenges: v }))}
            placeholder="어려웠던 점, 힘들었던 순간을 돌아봐요..." />

          <Field label="🎯 다음 주 집중할 것" value={weekly.next_focus}
            onChange={v => setWeekly(p => ({ ...p, next_focus: v }))}
            placeholder="다음 주에 꼭 해야 할 것, 집중할 것을 정해요..." />

          <Field label="⚡ 에너지 / 컨디션" value={weekly.energy}
            onChange={v => setWeekly(p => ({ ...p, energy: v }))}
            placeholder="이번 주 전반적인 컨디션, 에너지는 어땠나요?" rows={2} />
        </div>
      )}

      {/* 월간회고 */}
      {tab === 'monthly' && (
        <div className="flex flex-col gap-5">
          <NavRow label={`${monthYear}년 ${KO_MONTHS[monthMonth]}`}
            onPrev={prevMonth} onNext={nextMonth}
            disableNext={monthKey >= getMonthKey(now.getFullYear(), now.getMonth())} />

          <div className="flex flex-col gap-1 mb-0">
            <p className="text-xs text-ink-muted font-500">🙌 성과</p>
          </div>
          <div className="flex flex-col gap-4 pl-3 border-l-2 border-accent-pale">
            <Field label="Work" value={monthly.achievements_work}
              onChange={v => setMonthly(p => ({ ...p, achievements_work: v }))}
              placeholder="이번 달 업무 성과를 기록해보세요..." />
            <Field label="개인" value={monthly.achievements_personal}
              onChange={v => setMonthly(p => ({ ...p, achievements_personal: v }))}
              placeholder="이번 달 개인적인 성취를 기록해보세요..." />
          </div>

          <div className="h-px bg-paper-border" />

          <Field label="🌱 개선할 사항" value={monthly.improvements}
            onChange={v => setMonthly(p => ({ ...p, improvements: v }))}
            placeholder="이번 달 아쉬웠던 점, 개선이 필요한 부분을..." />

          <Field label="💡 개선 아이디어" value={monthly.ideas}
            onChange={v => setMonthly(p => ({ ...p, ideas: v }))}
            placeholder="더 잘하기 위한 아이디어를 적어보세요..." />

          <Field label="✔ 액션 아이템" value={monthly.actions}
            onChange={v => setMonthly(p => ({ ...p, actions: v }))}
            placeholder="다음 달에 실행할 구체적인 액션을..." />

          <Field label="기타" value={monthly.others}
            onChange={v => setMonthly(p => ({ ...p, others: v }))}
            placeholder="그 외 기록하고 싶은 내용..." rows={2} />
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="mt-6 flex items-center gap-3">
        <button onClick={handleSave}
          className="bg-ink text-white text-sm px-5 py-2.5 rounded-sm hover:opacity-75 transition-colors cursor-pointer">
          저장
        </button>
        {saved && <span className="text-xs text-ink">✓ 저장됐어요</span>}
      </div>

      {/* 저장된 목록 */}
      {savedKeys.length > 0 && (
        <div className="mt-8 bg-paper-card border border-paper-border rounded-sm p-4">
          <p className="text-xs text-ink-faint mb-3">저장된 회고</p>
          <div className="flex flex-col gap-1.5">
            {savedKeys.slice(0, 8).map(key => {
              const retro = retros[key]
              return (
                <div key={key} className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    if (retro.type === 'weekly') { setTab('weekly'); setWeekKey(key) }
                    else { setTab('monthly'); const [y, m] = key.split('-'); setMonthYear(parseInt(y)); setMonthMonth(parseInt(m) - 1) }
                  }}>
                  <span className="text-xs text-ink-faint group-hover:text-accent transition-colors">
                    {retro.type === 'weekly' ? `📆 ${key}` : `📋 ${key}`}
                  </span>
                  <span className="text-xs text-ink-faint/50 ml-auto">
                    {new Date(retro.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
