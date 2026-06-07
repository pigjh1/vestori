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

  // 주(column) 단위로 묶기 — 일요일 시작
  const weeks: (string | null)[][] = []
  let week: (string | null)[] = []

  // 첫 주 앞 패딩
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

  // 월 레이블 위치 (column index)
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((w, col) => {
    const first = w.find(d => d !== null)
    if (!first) return
    const m = new Date(first).getMonth()
    if (m !== lastMonth) { monthLabels.push({ label: KO_MONTHS[m], col }); lastMonth = m }
  })

  const CELL = 13   // px
  const GAP  = 2    // px

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

      {/* 연간 365 그리드 — 가로 스크롤 */}
      <div className="bg-white border border-paper-border rounded-sm p-4 mb-5 overflow-x-auto">
        {/* 월 레이블 행 */}
        <div className="flex mb-1" style={{ paddingLeft: `${CELL + GAP + 4}px` }}>
          {weeks.map((_, col) => {
            const mp = monthLabels.find(m => m.col === col)
            return (
              <div key={col} className="flex-shrink-0" style={{ width: CELL, marginRight: GAP }}>
                {mp && <span className="font-sans text-[9px] text-ink-faint whitespace-nowrap">{mp.label}</span>}
              </div>
            )
          })}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {/* 요일 레이블 열 */}
          <div className="flex flex-col flex-shrink-0" style={{ width: CELL, gap: GAP }}>
            {KO_DAYS.map((d, i) => (
              <div key={d} className="flex items-center justify-end"
                style={{ height: CELL }}>
                {i % 2 === 1 && (
                  <span className="font-sans text-ink-faint" style={{ fontSize: 8 }}>{d}</span>
                )}
              </div>
            ))}
          </div>

          {/* 주 컬럼들 */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col flex-shrink-0" style={{ gap: GAP }}>
              {week.map((dateKey, di) => {
                if (!dateKey) return <div key={di} style={{ width: CELL, height: CELL }} />
                const record  = records[dateKey]
                const future  = isFutureDate(dateKey)
                const isToday = dateKey === today
                const bg      = record
                  ? MOOD_COLORS[record.score].bg
                  : 'var(--color-paper-border)'

                return (
                  <div key={dateKey}
                    style={{
                      width: CELL, height: CELL,
                      borderRadius: 2,
                      background: bg,
                      opacity: future ? 0.18 : record ? 1 : 0.38,
                      outline: isToday ? '1.5px solid var(--color-accent)' : undefined,
                      outlineOffset: 1,
                      cursor: future ? 'default' : 'pointer',
                      flexShrink: 0,
                    }}
                    onClick={() => !future && openInput(dateKey)}
                    onMouseEnter={() => setHovered(dateKey)}
                    onMouseLeave={() => setHovered(null)}
                    title={record ? `${dateKey} — ${MOOD_COLORS[record.score].label}` : dateKey}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="font-sans text-[10px] text-ink-faint">낮음</span>
          {([1,2,3,4,5] as MoodScore[]).map(s => (
            <div key={s} style={{ width: CELL, height: CELL, background: MOOD_COLORS[s].bg, borderRadius: 2, flexShrink: 0 }}
              title={MOOD_COLORS[s].label} />
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
