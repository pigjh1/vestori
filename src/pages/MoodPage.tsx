import { useState } from 'react'
import type { MoodScore } from '@/types'
import { useMoodRecords } from '@/hooks/useMoodRecords'
import { useDesign } from '@/hooks/useDesign'
import { formatDateFull, pad } from '@/utils/date'

const MOOD_LIGHTNESS: Record<MoodScore, number> = {
  1: 55, 2: 60, 3: 65, 4: 70, 5: 75,
}

function getMoodColors(hue: number): Record<MoodScore, { bg: string; label: string; desc: string }> {
  return {
    1: { bg: `hsl(${hue}, 28%, ${MOOD_LIGHTNESS[1]}%)`, label: '힘든 하루',     desc: '매우 좋지 않음' },
    2: { bg: `hsl(${hue}, 30%, ${MOOD_LIGHTNESS[2]}%)`, label: '평탄하지 않은', desc: '좋지 않음' },
    3: { bg: `hsl(${hue}, 32%, ${MOOD_LIGHTNESS[3]}%)`, label: '그럭저럭',      desc: '보통' },
    4: { bg: `hsl(${hue}, 30%, ${MOOD_LIGHTNESS[4]}%)`, label: '괜찮은 하루',   desc: '좋음' },
    5: { bg: `hsl(${hue}, 28%, ${MOOD_LIGHTNESS[5]}%)`, label: '빛나는 하루',   desc: '아주 좋음' },
  }
}

const KO_MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const KO_DAYS = ['월','화','수','목','금','토','일']

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneDay = 86400000
  return Math.floor(diff / oneDay / 7) + 1
}

export function MoodPage() {
  const { records, setMood, deleteMood, todayRecord, today } = useMoodRecords()
  const { settings } = useDesign()
  const moodColors = getMoodColors(settings.accentHue)
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [inputScore, setInputScore] = useState<MoodScore>(3)
  const [moodView, setMoodView] = useState<'year' | 'month' | 'week'>('year')
  const [hovered, setHovered] = useState<string | null>(null)

  const year = new Date().getFullYear()

  const openInput = (dateKey: string) => {
    setSelectedDate(dateKey)
    const ex = records[dateKey]
    setInputScore(ex?.score ?? 3)
  }

  const handleSave = () => {
    if (!selectedDate) return
    setMood(selectedDate, inputScore, '')
    setSelectedDate(null)
  }

  const filled = Object.values(records).filter(r => r.date.startsWith(String(year)))
  const avg = filled.length > 0 ? (filled.reduce((s, r) => s + r.score, 0) / filled.length).toFixed(1) : null
  const hoveredRecord = hovered ? records[hovered] : null

  // Year 뷰: 일(행) x 월(열)
  const YearView = () => (
    <div className="bg-white border border-paper-border rounded-sm p-2 overflow-auto">
      <table className="border-collapse text-[10px]" style={{ minWidth: '100%' }}>
        <thead>
          <tr>
            <th className="text-center font-sans text-ink-faint p-0.5 text-[8px]" style={{width: '30px'}}>일</th>
            {KO_MONTHS.map((_, i) => (
              <th key={i} className="text-center font-sans text-ink-faint p-0.5 text-[8px]" style={{width: '20px'}}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({length: 31}, (_, d) => (
            <tr key={d}>
              <td className="text-center font-sans text-[8px] text-ink-muted font-500 p-0.5" style={{width: '30px'}}>{d + 1}</td>
              {Array.from({length: 12}, (_, m) => {
                const monthDays = new Date(year, m + 1, 0).getDate()
                if (d + 1 > monthDays) return <td key={m} style={{width: '20px', height: '20px', padding: '2px'}} />
                const dateKey = `${year}-${pad(m + 1)}-${pad(d + 1)}`
                const record = records[dateKey]
                const bg = record ? moodColors[record.score].bg : '#e5e7eb'
                const opacity = record ? 1 : 0.2
                return (
                  <td key={m} style={{width: '20px', height: '20px', padding: '2px'}}>
                    <div className="w-full h-full rounded-[2px] cursor-pointer transition-all hover:ring-2 hover:ring-accent"
                      style={{ background: bg, opacity }}
                      onClick={() => openInput(dateKey)}
                      onMouseEnter={() => setHovered(dateKey)}
                      onMouseLeave={() => setHovered(null)}
                      title={record ? `${dateKey} — ${moodColors[record.score].label}` : dateKey}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // Month 뷰: 12개월 한 화면
  const MonthView = () => (
    <div className="bg-white border border-paper-border rounded-sm p-4">
      <div className="grid grid-cols-2 gap-6">
        {Array.from({length: 12}, (_, m) => {
          const monthDays = new Date(year, m + 1, 0).getDate()
          const firstDay = new Date(year, m, 1).getDay()
          const startMonday = firstDay === 0 ? 6 : firstDay - 1
          
          return (
            <div key={m} className="min-w-0">
              <h3 className="font-serif text-[12px] italic text-ink mb-2">{KO_MONTHS[m]}</h3>
              <div className="grid grid-cols-7 gap-1">
                {KO_DAYS.map(d => (
                  <div key={d} className="text-center font-sans text-[9px] text-ink-faint font-500 h-5">{d}</div>
                ))}
                {Array.from({length: startMonday}).map((_, i) => (
                  <div key={`empty-${i}`} className="h-6" />
                ))}
                {Array.from({length: monthDays}, (_, d) => {
                  const dateKey = `${year}-${pad(m + 1)}-${pad(d + 1)}`
                  const record = records[dateKey]
                  const bg = record ? moodColors[record.score].bg : '#e5e7eb'
                  const opacity = record ? 1 : 0.25
                  return (
                    <div key={d} className="aspect-square">
                      <div className="w-full h-full rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-accent flex items-center justify-center font-sans text-[9px] text-white"
                        style={{ background: bg, opacity }}
                        onClick={() => openInput(dateKey)}
                        onMouseEnter={() => setHovered(dateKey)}
                        onMouseLeave={() => setHovered(null)}
                        title={dateKey}>
                        {d + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Week 뷰: 주(행) x 요일(열)
  const WeekView = () => {
    const weekMatrix: (string | null)[][] = Array.from({length: 53}, () => Array(7).fill(null))
    
    for (let d = 1; d <= 365; d++) {
      const date = new Date(year, 0, d)
      const dateKey = getDateKey(date.toISOString())
      const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1
      const weekNum = getWeekNumber(date)
      if (weekNum <= 52) weekMatrix[weekNum - 1][dayOfWeek] = dateKey
    }

    return (
      <div className="bg-white border border-paper-border rounded-sm p-2 overflow-auto">
        <table className="border-collapse text-[10px]" style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th className="text-center font-sans text-ink-faint p-0.5 text-[8px]" style={{width: '30px'}}>주</th>
              {KO_DAYS.map(day => (
                <th key={day} className="text-center font-sans text-ink-faint p-0.5 text-[8px]" style={{width: '20px'}}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekMatrix.map((week, wIdx) => (
              <tr key={wIdx}>
                <td className="text-center font-sans text-[8px] text-ink-muted font-500 p-0.5" style={{width: '30px'}}>W{wIdx + 1}</td>
                {week.map((dateKey, dIdx) => {
                  if (!dateKey) return <td key={dIdx} style={{width: '20px', height: '20px', padding: '2px'}} />
                  const record = records[dateKey]
                  const bg = record ? moodColors[record.score].bg : '#e5e7eb'
                  const opacity = record ? 1 : 0.2
                  return (
                    <td key={dIdx} style={{width: '20px', height: '20px', padding: '2px'}}>
                      <div className="w-full h-full rounded-[2px] cursor-pointer transition-all hover:ring-2 hover:ring-accent"
                        style={{ background: bg, opacity }}
                        onClick={() => openInput(dateKey)}
                        onMouseEnter={() => setHovered(dateKey)}
                        onMouseLeave={() => setHovered(null)}
                        title={dateKey}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-serif text-[18px] italic text-ink">{year}년의 기분</span>
        <div className="flex-1 h-px bg-paper-border" />
        {avg && <span className="font-sans text-[12px] text-ink-faint">평균 <span className="text-accent">{avg}</span></span>}
      </div>

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
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm" style={{ background: moodColors[todayRecord.score].bg }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[11px] text-ink-faint mb-0.5">오늘</p>
              <p className="font-body text-[14px] text-ink">{moodColors[todayRecord.score].label}</p>
            </div>
            <div className="w-5 h-5 rounded-sm" style={{ background: moodColors[todayRecord.score].bg }} />
          </div>
        </div>
      )}

      {/* 뷰 토글 */}
      <div className="flex gap-2 mb-5">
        {(['year', 'month', 'week'] as const).map(v => (
          <button key={v} onClick={() => setMoodView(v)}
            className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
              ${moodView === v ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
            {v === 'year' ? '연간' : v === 'month' ? '1주간' : '주간'}
          </button>
        ))}
      </div>

      {/* 뷰 렌더 */}
      {moodView === 'year' && <YearView />}
      {moodView === 'month' && <MonthView />}
      {moodView === 'week' && <WeekView />}

      {/* 호버 툴팁 */}
      {hovered && (
        <div className="mt-4 px-4 py-2 bg-white border border-paper-border rounded-sm text-center">
          <span className="font-sans text-[11px] text-ink-faint">
            {hovered}
            {hoveredRecord ? ` — ${moodColors[hoveredRecord.score].label}` : ' — 기록 없음'}
          </span>
        </div>
      )}

      {/* 기분 분포 */}
      {filled.length > 0 && (
        <div className="mt-5 bg-white border border-paper-border rounded-sm p-4">
          <p className="font-sans text-[11px] text-ink-faint mb-3 tracking-wide">기분 분포 ({filled.length}일)</p>
          <div className="flex flex-col gap-2">
            {([5,4,3,2,1] as MoodScore[]).map(score => {
              const count = filled.filter(r => r.score === score).length
              return (
                <div key={score} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-[2px] flex-shrink-0" style={{ background: moodColors[score].bg }} />
                  <span className="font-sans text-[11px] text-ink-muted w-20">{moodColors[score].label}</span>
                  <div className="flex-1 h-1.5 bg-paper-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / filled.length) * 100}%`, background: moodColors[score].bg }} />
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
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm transition-all" style={{ background: moodColors[inputScore].bg }} />
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
                        background: moodColors[s].bg,
                        opacity: inputScore === s ? 1 : 0.3,
                        transform: inputScore === s ? 'scaleY(1.1)' : 'scaleY(1)',
                      }} />
                    <span className="font-sans text-center leading-tight" style={{ fontSize: 9, color: 'var(--color-ink-faint)' }}>
                      {moodColors[s].desc}
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-body text-[13px] italic text-ink-muted text-center mb-4">{moodColors[inputScore].label}</p>

              <div className="flex gap-2">
                <button onClick={handleSave}
                  className="flex-1 bg-ink text-white font-sans text-[13px] py-2.5 rounded-sm hover:bg-accent transition-colors cursor-pointer">저장</button>
                {records[selectedDate] && (
                  <button onClick={() => { deleteMood(selectedDate); setSelectedDate(null) }}
                    className="font-sans text-[13px] text-ink-faint border border-paper-border px-3 py-2 rounded-sm cursor-pointer hover:border-accent-light transition-colors">삭제</button>
                )}
                <button onClick={() => setSelectedDate(null)}
                  className="font-sans text-[13px] text-ink-faint border border-paper-border px-3 py-2 rounded-sm cursor-pointer">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getDateKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
