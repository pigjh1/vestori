import { useState, useEffect } from 'react'
import type { Entry, FontFamily } from '@/types'
import { exportEntries, type ExportResult } from '@/utils/exportMd'
import { clearAllImages, getStorageSize } from '@/lib/imageDB'
import { useDesign } from '@/hooks/useDesign'
import { useMoodRecords } from '@/hooks/useMoodRecords'
import { useRoutine } from '@/hooks/useRoutine'
import { todayKey, getDateKey, subDays, startOfMonth, endOfMonth, startOfYear, formatDateDot } from '@/utils/date'

type RangePreset = '1d' | '7d' | '30d' | 'month' | 'year' | 'custom'
const PRESETS: { id: RangePreset; label: string }[] = [
  { id: '1d', label: '오늘' }, { id: '7d', label: '최근 7일' }, { id: '30d', label: '최근 30일' },
  { id: 'month', label: '이번 달' }, { id: 'year', label: '올해 전체' }, { id: 'custom', label: '직접 설정' },
]

function getRange(preset: RangePreset, cs: string, ce: string): [string, string] {
  const today = todayKey()
  const now = new Date()
  switch (preset) {
    case '1d':    return [today, today]
    case '7d':    return [getDateKey(subDays(now, 6).toISOString()), today]
    case '30d':   return [getDateKey(subDays(now, 29).toISOString()), today]
    case 'month': return [getDateKey(startOfMonth(now).toISOString()), getDateKey(endOfMonth(now).toISOString())]
    case 'year':  return [getDateKey(startOfYear(now).toISOString()), today]
    case 'custom': return [cs, ce]
  }
}

function formatBytes(b: number): string {
  if (b === 0) return '0 B'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

const FONT_OPTIONS: { id: FontFamily; label: string; family: string }[] = [
  { id: 'noto-sans', label: '노토산스', family: '"Noto Sans KR", sans-serif' },
  { id: 'noto-serif', label: '노토세리프', family: '"Noto Serif KR", serif' },
  { id: 'gowun-batang', label: '고운바탕', family: '"Gowun Batang", serif' },
  { id: 'gowun-dodum', label: '고운돋움', family: '"Gowun Dodum", sans-serif' },
  { id: 'noto-brush', label: '손글씨(붓)', family: '"Nanum Brush Script", cursive' },
  { id: 'noto-pen', label: '손글씨(펜)', family: '"Nanum Pen Script", cursive' },
  { id: 'jetbrains-mono', label: '모노스페이스', family: '"JetBrains Mono", monospace' },
]

const HUE_PRESETS = [
  { label: '갈색 (기본)', hue: 25 },
  { label: '초록',       hue: 145 },
  { label: '파랑',       hue: 210 },
  { label: '보라',       hue: 270 },
  { label: '분홍',       hue: 340 },
]

interface Props { entries: Entry[] }

export function SettingsPage({ entries }: Props) {
  const today = todayKey()
  const { entries: moodEntries } = useMoodRecords()
  const { habits } = useRoutine()
  const { settings, setFont, setAccentHue, reset } = useDesign()
  const [preset, setPreset] = useState<RangePreset>('1d')
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd] = useState(today)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<number | null>(null)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearDone, setClearDone] = useState(false)
  const [deleteEntriesConfirm, setDeleteEntriesConfirm] = useState(false)
  const [deleteEntriesDone, setDeleteEntriesDone] = useState(false)
  const [deleteMoodConfirm, setDeleteMoodConfirm] = useState(false)
  const [deleteMoodDone, setDeleteMoodDone] = useState(false)
  const [deleteRoutineConfirm, setDeleteRoutineConfirm] = useState(false)
  const [deleteRoutineDone, setDeleteRoutineDone] = useState(false)

  useEffect(() => { getStorageSize().then(setImageSize) }, [])

  const imageCount = entries.reduce((s, e) => s + e.imageIds.length, 0)
  const [startDate, endDate] = getRange(preset, customStart, customEnd)
  const previewCount = entries.filter(e => {
    const d = getDateKey(e.createdAt)
    return d >= startDate && d <= endDate
  }).length
  const handleExport = async () => {
    if (previewCount === 0) return
    setExporting(true); setResult(null); setExportError(null)
    try { setResult(await exportEntries(entries, moodEntries, habits, startDate, endDate)) }
    catch { setExportError('내보내기 중 오류가 발생했어요.') }
    finally { setExporting(false) }
  }

  const handleClearDB = async () => {
    if (!clearConfirm) { setClearConfirm(true); return }
    await clearAllImages()
    setImageSize(0); setClearDone(true); setClearConfirm(false)
    setTimeout(() => setClearDone(false), 3000)
  }

  const handleDeleteAllEntries = async () => {
    if (!deleteEntriesConfirm) { setDeleteEntriesConfirm(true); return }
    localStorage.removeItem('vestori:entries')
    setDeleteEntriesDone(true); setDeleteEntriesConfirm(false)
    setTimeout(() => { setDeleteEntriesDone(false); window.location.reload() }, 2000)
  }

  const handleDeleteMood = () => {
    if (!deleteMoodConfirm) { setDeleteMoodConfirm(true); return }
    localStorage.removeItem('vestori:moods')
    setDeleteMoodDone(true); setDeleteMoodConfirm(false)
    setTimeout(() => { setDeleteMoodDone(false); window.location.reload() }, 2000)
  }

  const handleDeleteRoutine = () => {
    if (!deleteRoutineConfirm) { setDeleteRoutineConfirm(true); return }
    localStorage.removeItem('vestori:habits')
    localStorage.removeItem('vestori:checks')
    setDeleteRoutineDone(true); setDeleteRoutineConfirm(false)
    setTimeout(() => { setDeleteRoutineDone(false); window.location.reload() }, 2000)
  }

  return (
    <div className="flex flex-col gap-10">

      {/* ── 디자인 ── */}
      <section>
        <SectionTitle>디자인</SectionTitle>

        <div className="mb-5">
          <Label>글꼴</Label>
          <div className="flex gap-2 flex-wrap">
            {FONT_OPTIONS.map(({ id, label, family }) => (
              <button key={id} onClick={() => setFont(id)}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-sm border transition-all cursor-pointer
                  ${settings.font === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light bg-white'}`}>
                <span className="text-[20px] leading-none" style={{ fontFamily: family }}>Aa</span>
                <span className="font-sans text-[11px]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>대표 색상</Label>
          <div className="flex gap-2 flex-wrap mb-3">
            {HUE_PRESETS.map(({ label, hue }) => (
              <button key={hue} onClick={() => setAccentHue(hue)}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm border transition-all cursor-pointer
                  ${settings.accentHue === hue ? 'border-accent bg-accent-pale' : 'border-paper-border bg-white hover:border-accent-light'}`}>
                <span className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10" style={{ background: `hsl(${hue}, 45%, 40%)` }} />
                <span className="font-sans text-[12px] text-ink-muted">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-white border border-paper-border rounded-sm px-4 py-3">
            <label className="font-sans text-[12px] text-ink-muted flex-shrink-0">커스텀</label>
            <input type="range" min={0} max={360} value={settings.accentHue} onChange={e => setAccentHue(Number(e.target.value))}
              className="flex-1 accent-[var(--color-accent)]" />
            <div className="w-6 h-6 rounded-sm flex-shrink-0 border border-black/10" style={{ background: `hsl(${settings.accentHue}, 45%, 40%)` }} />
          </div>
        </div>

        <button onClick={reset} className="mt-4 font-sans text-[12px] text-ink-faint hover:text-accent border-none bg-none p-0 cursor-pointer transition-colors">기본값으로 초기화</button>
      </section>

      {/* ── 내보내기 ── */}
      <section>
        <SectionTitle>마크다운으로 내보내기</SectionTitle>
        <div className="mb-4">
          <Label>기간 선택</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(({ id, label }) => (
              <button key={id} onClick={() => setPreset(id)}
                className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                  ${preset === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light bg-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-3 mb-4 p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex flex-col gap-1 flex-1">
              <Label>시작일</Label>
              <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)}
                className="font-sans text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-accent-light" />
            </div>
            <span className="font-sans text-[12px] text-ink-faint mt-5">—</span>
            <div className="flex flex-col gap-1 flex-1">
              <Label>종료일</Label>
              <input type="date" value={customEnd} min={customStart} max={today} onChange={e => setCustomEnd(e.target.value)}
                className="font-sans text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-accent-light" />
            </div>
          </div>
        )}

        <div className="p-4 bg-white border border-paper-border rounded-sm mb-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
          <p className="font-sans text-[11px] text-ink-faint mb-1">내보낼 내용</p>
          <p className="font-body text-[14px] text-ink">
            {startDate === endDate
              ? <><span className="text-accent">{formatDateDot(startDate)}</span> 하루</>
              : <><span className="text-accent">{formatDateDot(startDate)}</span> ~ <span className="text-accent">{formatDateDot(endDate)}</span></>}
          </p>
          <p className="font-sans text-[11px] text-ink-faint mt-1">
            {previewCount > 0 ? <><span className="text-ink-muted">{previewCount}개</span>의 기록</> : '해당 기간에 기록이 없어요'}
          </p>
        </div>

        <button onClick={handleExport} disabled={exporting || previewCount === 0}
          className="w-full bg-ink text-white font-sans text-[13px] py-3 rounded-sm hover:bg-accent transition-colors disabled:opacity-40 cursor-pointer">
          {exporting ? '내보내는 중...' : `${previewCount}개 기록 내보내기`}
        </button>
        {result && <div className="mt-3 p-3 bg-accent-pale border border-accent/20 rounded-sm"><p className="font-sans text-[12px] text-accent">✓ {result.dayCount}일 · {result.fileCount}개 파일 완료</p></div>}
        {exportError && <p className="mt-3 font-sans text-[12px] text-red-400">{exportError}</p>}
      </section>

      {/* ── 데이터 ── */}
      <section>
        <SectionTitle>데이터</SectionTitle>
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-sans text-[12px] text-ink-muted mb-0.5">기록 (localStorage)</p>
                <p className="font-sans text-[12px] text-ink-faint"><span className="text-accent">{entries.length}개</span>의 기록</p>
              </div>
              {entries.length > 0 && (
                <button onClick={handleDeleteAllEntries}
                  className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteEntriesConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
                  {deleteEntriesConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteEntriesConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-sans text-[11px] text-red-400 flex-1">모든 기록이 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteEntriesConfirm(false)} className="font-sans text-[11px] text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteEntriesDone && <p className="font-sans text-[11px] text-accent mt-1">✓ 모든 기록이 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-sans text-[12px] text-ink-muted mb-0.5">이미지 (IndexedDB)</p>
                <p className="font-sans text-[12px] text-ink-faint">
                  {imageCount > 0 ? <><span className="text-accent">{imageCount}장</span> · {imageSize !== null ? formatBytes(imageSize) : '계산 중...'}</> : '저장된 이미지 없음'}
                </p>
              </div>
              {imageCount > 0 && (
                <button onClick={handleClearDB}
                  className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${clearConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
                  {clearConfirm ? '정말 삭제할게요' : '전체 삭제'}
                </button>
              )}
            </div>
            {clearConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-sans text-[11px] text-red-400 flex-1">모든 이미지가 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setClearConfirm(false)} className="font-sans text-[11px] text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {clearDone && <p className="font-sans text-[11px] text-accent mt-1">✓ 이미지가 모두 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-sans text-[12px] text-ink-muted mb-0.5">기분 기록</p>
                <p className="font-sans text-[12px] text-ink-faint"><span className="text-accent">{entries.length}개</span>의 기분 기록</p>
              </div>
              {Object.keys(moodEntries).length > 0 && (
                <button onClick={handleDeleteMood}
                  className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteMoodConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
                  {deleteMoodConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteMoodConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-sans text-[11px] text-red-400 flex-1">모든 기분 기록이 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteMoodConfirm(false)} className="font-sans text-[11px] text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteMoodDone && <p className="font-sans text-[11px] text-accent mt-1">✓ 모든 기분 기록이 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-sans text-[12px] text-ink-muted mb-0.5">루틴</p>
                <p className="font-sans text-[12px] text-ink-faint"><span className="text-accent">{habits.length}개</span>의 루틴</p>
              </div>
              {habits.length > 0 && (
                <button onClick={handleDeleteRoutine}
                  className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteRoutineConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-accent-light'}`}>
                  {deleteRoutineConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteRoutineConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-sans text-[11px] text-red-400 flex-1">모든 루틴이 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteRoutineConfirm(false)} className="font-sans text-[11px] text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteRoutineDone && <p className="font-sans text-[11px] text-accent mt-1">✓ 모든 루틴이 삭제됐어요</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <h3 className="font-serif text-[16px] italic text-ink whitespace-nowrap">{children}</h3>
      <div className="flex-1 h-px bg-paper-border" />
    </div>
  )
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[11px] text-ink-faint tracking-wide mb-2">{children}</p>
}
