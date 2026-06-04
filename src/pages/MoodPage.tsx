import { useState } from 'react'
import {
  format, startOfYear, endOfYear, eachDayOfInterval,
  getDay, isToday, isFuture, parseISO
} from 'date-fns'
import { ko } from 'date-fns/locale'
import type { MoodScore, MoodRecord } from '@/types'
import { useMoodRecords } from '@/hooks/useMoodRecords'

// ── 색상 팔레트 (1=침울 → 5=최고) ──────────────────
const MOOD_COLORS: Record<MoodScore, { bg: string; label: string; desc: string }> = {
  1: { bg: '#6b7280', label: '힘든 하루', desc: '매우 좋지 않음' },
  2: { bg: '#9ca3af', label: '평탄하지 않은', desc: '좋지 않음' },
  3: { bg: '#c49a6c', label: '그럭저럭', desc: '보통' },
  4: { bg: '#8b7355', label: '괜찮은 하루', desc: '좋음' },
  5: { bg: '#5c4a2a', label: '빛나는 하루', desc: '아주 좋음' },
}

const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const WEEKDAY_LABELS = ['일','월','화','수','목','금','토']

function getCellColor(record: MoodRecord | undefined, isF: boolean): string {
  if (isF) return 'transparent'
  if (!record) return 'var(--color-paper-border)'
  return MOOD_COLORS[record.score].bg
}

export function MoodPage() {
  const { records, setMood, deleteMood, todayRecord, today } = useMoodRecords()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [inputScore, setInputScore] = useState<MoodScore>(3)
  const [inputNote, setInputNote] = useState('')
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const year = new Date().getFullYear()
  const yearStart = startOfYear(new Date())
  const yearEnd = endOfYear(new Date())
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })

  // 주 단위로 그룹핑 (GitHub 방식: 일요일 시작)
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // 첫 주 앞쪽 패딩
  const firstDayOfWeek = getDay(yearStart) // 0=일
  for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(new Date(0)) // dummy

  allDays.forEach(day => {
    currentWeek.push(day)
    if (getDay(day) === 6) { // 토요일
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(new Date(0))
    weeks.push(currentWeek)
  }

  // 월 라벨 위치
  const monthPositions: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, col) => {
    const realDay = week.find(d => d.getFullYear() === year)
    if (!realDay) return
    const m = realDay.getMonth()
    if (m !== lastMonth) { monthPositions.push({ label: MONTH_LABELS[m], col }); lastMonth = m }
  })

  const openInput = (dateKey: string) => {
    if (isFuture(parseISO(dateKey))) return
    setSelectedDate(dateKey)
    const existing = records[dateKey]
    setInputScore(existing?.score ?? 3)
    setInputNote(existing?.note ?? '')
  }

  const handleSave = () => {
    if (!selectedDate) return
    setMood(selectedDate, inputScore, inputNote)
    setSelectedDate(null)
  }

  const handleDelete = () => {
    if (!selectedDate) return
    deleteMood(selectedDate)
    setSelectedDate(null)
  }

  const hovered = hoveredDate ? records[hoveredDate] : null

  // 통계
  const filled = Object.values(records).filter(r => r.date.startsWith(String(year)))
  const avg = filled.length > 0
    ? (filled.reduce((s, r) => s + r.score, 0) / filled.length).toFixed(1)
    : null
  const scoreCount = [1,2,3,4,5].map(s => ({
    score: s as MoodScore,
    count: filled.filter(r => r.score === s).length,
  }))

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-baseline gap-3 mb-8">
        <span className="font-serif text-[20px] italic text-ink">{year}년의 기분</span>
        <div className="flex-1 h-px bg-paper-border" />
        {avg && (
          <span className="font-sans text-[12px] text-ink-faint font-light">평균 <span className="text-accent">{avg}</span></span>
        )}
      </div>

      {/* 오늘 기록 CTA */}
      {!todayRecord && (
        <button onClick={() => openInput(today)}
          className="w-full mb-8 bg-white border border-paper-border rounded-sm px-5 py-4 text-left hover:border-accent-light transition-colors cursor-pointer relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
          <p className="font-sans text-[12px] text-ink-muted font-light">오늘 기분을 아직 기록하지 않았어요.</p>
          <p className="font-body text-[13px] italic text-ink-faint mt-0.5">지금 어떠세요?</p>
        </button>
      )}

      {todayRecord && (
        <div onClick={() => openInput(today)}
          className="w-full mb-8 bg-white border border-paper-border rounded-sm px-5 py-4 cursor-pointer hover:border-accent-light transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm" style={{ background: MOOD_COLORS[todayRecord.score].bg }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[11px] text-ink-faint font-light mb-0.5">오늘</p>
              <p className="font-body text-[14px] text-ink font-light">{MOOD_COLORS[todayRecord.score].label}</p>
              {todayRecord.note && <p className="font-sans text-[11px] text-ink-faint mt-1 italic">{todayRecord.note}</p>}
            </div>
            <div className="w-5 h-5 rounded-sm flex-shrink-0" style={{ background: MOOD_COLORS[todayRecord.score].bg }} />
          </div>
        </div>
      )}

      {/* 연간 그리드 */}
      <div className="bg-white border border-paper-border rounded-sm p-5 mb-6 overflow-x-auto">
        {/* 월 라벨 */}
        <div className="flex mb-1" style={{ paddingLeft: '24px' }}>
          {weeks.map((_, col) => {
            const mp = monthPositions.find(m => m.col === col)
            return (
              <div key={col} className="flex-shrink-0" style={{ width: '13px', marginRight: '2px' }}>
                {mp && <span className="font-sans text-[9px] text-ink-faint whitespace-nowrap">{mp.label}</span>}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0">
          {/* 요일 라벨 */}
          <div className="flex flex-col mr-1.5 flex-shrink-0">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={d} className="flex items-center justify-end" style={{ height: '13px', marginBottom: '2px' }}>
                {(i % 2 === 1) && <span className="font-sans text-[9px] text-ink-faint">{d}</span>}
              </div>
            ))}
          </div>

          {/* 주 컬럼 */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col flex-shrink-0" style={{ marginRight: '2px' }}>
              {week.map((day, di) => {
                const isReal = day.getFullYear() === year
                const dateKey = isReal ? format(day, 'yyyy-MM-dd') : ''
                const record = isReal ? records[dateKey] : undefined
                const future = isReal && isFuture(day) && !isToday(day)
                const todayCell = isReal && isToday(day)

                return (
                  <div key={di}
                    style={{
                      width: '13px', height: '13px', marginBottom: '2px',
                      background: isReal ? getCellColor(record, future) : 'transparent',
                      borderRadius: '2px',
                      opacity: future ? 0.2 : 1,
                      outline: todayCell ? '1.5px solid var(--color-accent)' : undefined,
                      outlineOffset: '1px',
                      cursor: isReal && !future ? 'pointer' : 'default',
                      transition: 'transform 0.1s',
                    }}
                    onClick={() => isReal && !future && openInput(dateKey)}
                    onMouseEnter={() => isReal && setHoveredDate(dateKey)}
                    onMouseLeave={() => setHoveredDate(null)}
                    title={isReal && !future ? format(day, 'M월 d일 (E)', { locale: ko }) : ''}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="font-sans text-[10px] text-ink-faint">낮음</span>
          {([1,2,3,4,5] as MoodScore[]).map(s => (
            <div key={s} className="w-3 h-3 rounded-[2px]" style={{ background: MOOD_COLORS[s].bg }} />
          ))}
          <span className="font-sans text-[10px] text-ink-faint">높음</span>
        </div>
      </div>

      {/* 호버 툴팁 */}
      {hoveredDate && (
        <div className="mb-4 px-4 py-2 bg-white border border-paper-border rounded-sm text-center transition-all">
          <span className="font-sans text-[11px] text-ink-faint">
            {format(parseISO(hoveredDate), 'M월 d일 (E)', { locale: ko })}
            {hovered ? ` — ${MOOD_COLORS[hovered.score].label}${hovered.note ? ` · ${hovered.note}` : ''}` : ' — 기록 없음'}
          </span>
        </div>
      )}

      {/* 분포 */}
      {filled.length > 0 && (
        <div className="bg-white border border-paper-border rounded-sm p-5 mb-6">
          <p className="font-sans text-[11px] text-ink-faint font-light mb-3 tracking-wide">기분 분포 ({filled.length}일)</p>
          <div className="flex flex-col gap-2">
            {scoreCount.reverse().map(({ score, count }) => (
              <div key={score} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-[2px] flex-shrink-0" style={{ background: MOOD_COLORS[score].bg }} />
                <span className="font-sans text-[11px] text-ink-muted font-light w-20">{MOOD_COLORS[score].label}</span>
                <div className="flex-1 h-1.5 bg-paper-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: filled.length ? `${(count / filled.length) * 100}%` : '0%', background: MOOD_COLORS[score].bg }} />
                </div>
                <span className="font-sans text-[11px] text-ink-faint w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기록 입력 모달 */}
      {selectedDate && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSelectedDate(null)}>
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={() => setSelectedDate(null)} />
          <div className="relative bg-paper border border-paper-border rounded-sm w-full max-w-sm shadow-xl z-10 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm transition-all"
              style={{ background: MOOD_COLORS[inputScore].bg }} />
            <div className="px-6 pt-5 pb-6">
              <p className="font-sans text-[11px] text-ink-faint font-light mb-1">
                {format(parseISO(selectedDate), 'yyyy년 M월 d일 (E)', { locale: ko })}
              </p>
              <p className="font-serif text-[16px] italic text-ink mb-5">오늘 하루는 어땠나요?</p>

              {/* 색상 선택 */}
              <div className="flex gap-2 mb-5 justify-between">
                {([1,2,3,4,5] as MoodScore[]).map(s => (
                  <button key={s} onClick={() => setInputScore(s)}
                    className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer bg-none border-none p-0 group">
                    <div className="w-full h-8 rounded-sm transition-all duration-150"
                      style={{
                        background: MOOD_COLORS[s].bg,
                        opacity: inputScore === s ? 1 : 0.3,
                        transform: inputScore === s ? 'scaleY(1.15)' : 'scaleY(1)',
                      }} />
                    <span className="font-sans text-[9px] text-ink-faint">{MOOD_COLORS[s].desc}</span>
                  </button>
                ))}
              </div>

              {/* 선택된 기분 레이블 */}
              <p className="font-body text-[13px] italic text-ink-muted text-center mb-4">
                {MOOD_COLORS[inputScore].label}
              </p>

              {/* 메모 */}
              <input
                type="text"
                value={inputNote}
                onChange={e => setInputNote(e.target.value)}
                placeholder="한 줄 메모 (선택)"
                maxLength={80}
                className="w-full font-sans text-[13px] font-light text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-accent-light transition-colors placeholder:text-ink-faint mb-4"
              />

              <div className="flex gap-2">
                <button onClick={handleSave}
                  className="flex-1 bg-ink text-white font-sans text-[12px] py-2 rounded-sm hover:bg-accent transition-colors cursor-pointer">
                  저장
                </button>
                {records[selectedDate] && (
                  <button onClick={handleDelete}
                    className="font-sans text-[12px] text-ink-faint hover:text-accent border border-paper-border px-3 py-2 rounded-sm transition-colors cursor-pointer">
                    삭제
                  </button>
                )}
                <button onClick={() => setSelectedDate(null)}
                  className="font-sans text-[12px] text-ink-faint hover:text-ink border border-paper-border px-3 py-2 rounded-sm transition-colors cursor-pointer">
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
