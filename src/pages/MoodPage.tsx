import { useState } from 'react'
import type { MoodScore } from '@/types'
import { useMoodRecords } from '@/hooks/useMoodRecords'
import { formatDateFull, isFutureDate, eachDayOfInterval, startOfYear, getDateKey, getDayOfWeek } from '@/utils/date'

const MOOD_COLORS: Record<MoodScore, { bg: string; label: string; desc: string }> = {
  1: { bg: '#6b7280', label: '힘든 하루',     desc: '매우 좋지 않음' },
  2: { bg: '#9ca3af', label: '평탄하지 않은', desc: '좋지 않음' },
  3: { bg: '#c49a6c', label: '그럭저럭',      desc: '보통' },
  4: { bg: '#8b7355', label: '괜찮은 하루',   desc: '좋음' },
  5: { bg: '#5c4a2a', label: '빛나는 하루',   desc: '아주 좋음' },
}

const KO_MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const KO_DAYS   = ['일','월','화','수','목','금','토']

export function MoodPage() {
  const { records, setMood, deleteMood, todayRecord, today } = useMoodRecords()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [inputScore, setInputScore] = useState<MoodScore>(3)
  const [inputNote, setInputNote]   = useState('')
  const [hovered, setHovered]       = useState<string | null>(null)

  const year     = new Date().getFullYear()
  const yearStart = startOfYear(new Date())
  const allDays   = eachDayOfInterval(yearStart, new Date())

  // 행 = 주(week), 열 = 요일(0~6) — 모바일 세로 레이아웃
  // weeks[i] = 그 주의 7일 (일~토), null = 해당 날짜 없음
  const weeks: (string | null)[][] = []
  let week: (string | null)[] = []

  const firstDow = getDayOfWeek(getDateKey(yearStart.toISOString()))
  for (let i = 0; i < firstDow; i++) week.push(null)

  allDays.forEach(day => {
    const key = getDateKey(day.toISOString())
    week.push(key)
    if (day.getDay() === 6) { weeks.push(week); week = [] }
  })
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  // 월 레이블 — 해당 주가 시작되는 row index
  const monthLabels: { label: string; row: number }[] = []
  let lastMonth = -1
  weeks.forEach((w, row) => {
    const first = w.find(d => d !== null)
    if (!first) return
    const m = new Date(first).getMonth()
    if (m !== lastMonth) { monthLabels.push({ label: KO_MONTHS[m], row }); lastMonth = m }
  })

  // 셀 크기: 375px 기준 (16px*2 패딩 + 4px 여백) → (375-32-8) / 7 ≈ 47px
  // 너무 크면 이상하니 최대 40px 캡
  const CELL = 'minmax(0, 40px)'
  const GAP  = 3    // px

  const openInput = (dateKey: string) => {
    if (isFutureDate(dateKey)) return
    setSelectedDate(dateKey)
    const ex = records[dateKey]
    setInputScore(ex?.score ?? 3)
    setInputNote(ex?.note ?? '')
  }

  const handleSave = () => {
    if (!selectedDate) return
    setMood(selectedDate, inputScore, inputNote)
    setSelectedDate(null)
  }

  const filled = Object.values(records).filter(r => r.date.startsWith(String(year)))
  const avg    = filled.length > 0
    ? (filled.reduce((s, r) => s + r.score, 0) / filled.length).toFixed(1) : null
  const hoveredRecord = hovered ? records[hovered] : null

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-serif text-[18px] italic text-ink">{year}년의 기분</span>
        <div className="flex-1 h-px bg-paper-border" />
        {avg && <span className="font-sans text-[12px] text-ink-faint">평균 <span className="text-accent">{avg}</span></span>}
      </div>

      {/* 오늘 CTA */}
      {!todayRecord ? (
        <button onClick={() => openInput(today)}
          className="w-full mb-5 bg-white border border-paper-border rounded-sm px-4 py-3.5 text-left hover:border-accent-light transition-colors cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
          <p className="font-sans text-[12px] text-ink-muted">오늘 기분을 아직 기록하지 않았어요.</p>
          <p className="font-body text-[13px] italic text-ink-faint mt-0.5">지금 어떠세요?</p>
        </button>
      ) : (
        <div onClick={() => openInput(today)}
          className="w-full mb-5 bg-white border border-paper-border rounded-sm px-4 py-3.5 cursor-pointer hover:border-accent-light transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm" style={{ background: MOOD_COLORS[todayRecord.score].bg }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[11px] text-ink-faint mb-0.5">오늘</p>
              <p className="font-body text-[14px] text-ink">{MOOD_COLORS[todayRecord.score].label}</p>
              {todayRecord.note && <p className="font-sans text-[11px] text-ink-faint mt-0.5 italic">{todayRecord.note}</p>}
            </div>
            <div className="w-5 h-5 rounded-sm" style={{ background: MOOD_COLORS[todayRecord.score].bg }} />
          </div>
        </div>
      )}

      {/* 연간 365 그리드 — 행=주, 열=요일, 모바일 꽉 채움 */}
      <div className="bg-white border border-paper-border rounded-sm p-3 mb-5">
        {/* 요일 헤더 */}
        <div className="grid mb-1" style={{ gridTemplateColumns: `28px repeat(7, ${CELL})`, gap: GAP }}>
          <div />
          {KO_DAYS.map(d => (
            <div key={d} className="text-center font-sans text-ink-faint" style={{ fontSize: 9 }}>{d}</div>
          ))}
        </div>

        {/* 주 행들 */}
        <div className="flex flex-col" style={{ gap: GAP }}>
          {weeks.map((week, wi) => {
            const ml = monthLabels.find(m => m.row === wi)
            return (
              <div key={wi} className="grid items-center" style={{ gridTemplateColumns: `28px repeat(7, ${CELL})`, gap: GAP }}>
                {/* 월 레이블 */}
                <div className="flex items-center justify-end pr-1">
                  {ml && <span className="font-sans text-ink-faint whitespace-nowrap" style={{ fontSize: 9 }}>{ml.label}</span>}
                </div>
                {/* 7일 셀 */}
                {week.map((dateKey, di) => {
                  if (!dateKey) return <div key={di} style={{ aspectRatio: '1', borderRadius: 3 }} />
                  const record  = records[dateKey]
                  const future  = isFutureDate(dateKey)
                  const isToday = dateKey === today
                  const bg      = record ? MOOD_COLORS[record.score].bg : 'var(--color-paper-border)'
                  return (
                    <div key={dateKey}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 3,
                        background: bg,
                        opacity: future ? 0.18 : record ? 1 : 0.35,
                        outline: isToday ? '2px solid var(--color-accent)' : undefined,
                        outlineOffset: 1,
                        cursor: future ? 'default' : 'pointer',
                      }}
                      onClick={() => !future && openInput(dateKey)}
                      onMouseEnter={() => setHovered(dateKey)}
                      onMouseLeave={() => setHovered(null)}
                      title={record ? `${dateKey} — ${MOOD_COLORS[record.score].label}` : dateKey}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="font-sans text-[10px] text-ink-faint">낮음</span>
          {([1,2,3,4,5] as MoodScore[]).map(s => (
            <div key={s} className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ background: MOOD_COLORS[s].bg }} title={MOOD_COLORS[s].label} />
          ))}
          <span className="font-sans text-[10px] text-ink-faint">높음</span>
        </div>
      </div>

      {/* 호버 툴팁 */}
      {hovered && (
        <div className="mb-4 px-4 py-2 bg-white border border-paper-border rounded-sm text-center">
          <span className="font-sans text-[11px] text-ink-faint">
            {hovered}
            {hoveredRecord
              ? ` — ${MOOD_COLORS[hoveredRecord.score].label}${hoveredRecord.note ? ` · ${hoveredRecord.note}` : ''}`
              : ' — 기록 없음'}
          </span>
        </div>
      )}

      {/* 기분 분포 */}
      {filled.length > 0 && (
        <div className="bg-white border border-paper-border rounded-sm p-4">
          <p className="font-sans text-[11px] text-ink-faint mb-3 tracking-wide">기분 분포 ({filled.length}일)</p>
          <div className="flex flex-col gap-2">
            {([5,4,3,2,1] as MoodScore[]).map(score => {
              const count = filled.filter(r => r.score === score).length
              return (
                <div key={score} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-[2px] flex-shrink-0" style={{ background: MOOD_COLORS[score].bg }} />
                  <span className="font-sans text-[11px] text-ink-muted w-20">{MOOD_COLORS[score].label}</span>
                  <div className="flex-1 h-1.5 bg-paper-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(count / filled.length) * 100}%`, background: MOOD_COLORS[score].bg }} />
                  </div>
                  <span className="font-sans text-[11px] text-ink-faint w-5 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 입력 모달 */}
      {selectedDate && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={() => setSelectedDate(null)} />
          <div className="relative bg-paper border border-paper-border rounded-sm w-full max-w-sm shadow-xl z-10 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm transition-all"
              style={{ background: MOOD_COLORS[inputScore].bg }} />
            <div className="px-6 pt-5 pb-6">
              <p className="font-sans text-[11px] text-ink-faint mb-0.5">{formatDateFull(selectedDate)}</p>
              <p className="font-serif text-[16px] italic text-ink mb-5">오늘 하루는 어땠나요?</p>

              <div className="flex gap-2 mb-3">
                {([1,2,3,4,5] as MoodScore[]).map(s => (
                  <button key={s} onClick={() => setInputScore(s)}
                    className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer bg-none border-none p-0">
                    <div className="w-full rounded-sm transition-all"
                      style={{
                        height: 40,
                        background: MOOD_COLORS[s].bg,
                        opacity: inputScore === s ? 1 : 0.3,
                        transform: inputScore === s ? 'scaleY(1.1)' : 'scaleY(1)',
                      }} />
                    <span className="font-sans text-center leading-tight" style={{ fontSize: 9, color: 'var(--color-ink-faint)' }}>
                      {MOOD_COLORS[s].desc}
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-body text-[13px] italic text-ink-muted text-center mb-4">{MOOD_COLORS[inputScore].label}</p>

              <input type="text" value={inputNote} onChange={e => setInputNote(e.target.value)}
                placeholder="한 줄 메모 (선택)" maxLength={80}
                className="w-full font-sans text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-accent-light transition-colors mb-4 placeholder:text-ink-faint" />

              <div className="flex gap-2">
                <button onClick={handleSave}
                  className="flex-1 bg-ink text-white font-sans text-[13px] py-2.5 rounded-sm hover:bg-accent transition-colors cursor-pointer">
                  저장
                </button>
                {records[selectedDate] && (
                  <button onClick={() => { deleteMood(selectedDate); setSelectedDate(null) }}
                    className="font-sans text-[13px] text-ink-faint border border-paper-border px-3 py-2 rounded-sm cursor-pointer hover:border-accent-light transition-colors">
                    삭제
                  </button>
                )}
                <button onClick={() => setSelectedDate(null)}
                  className="font-sans text-[13px] text-ink-faint border border-paper-border px-3 py-2 rounded-sm cursor-pointer">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
