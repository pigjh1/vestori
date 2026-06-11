import { useState, useEffect, useRef } from 'react'
import type { Entry, FontFamily } from '@/types'
import { exportEntries, type ExportResult } from '@/utils/exportMd'
import { exportBackup, importBackup, type MergeStrategy } from '@/utils/backup'
import { clearAllImages, getStorageSize } from '@/lib/imageDB'
import { useDesign } from '@/hooks/useDesign'
import { useMoodRecords } from '@/hooks/useMoodRecords'
import { useRoutine } from '@/hooks/useRoutine'
import { useRetrospect } from '@/hooks/useRetrospect'
import { useDiet } from '@/hooks/useDiet'
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
  { label: '로즈',   hue: 355 },
  { label: '핑크',   hue: 330 },
  { label: '살구',   hue: 20  },
  { label: '황금',   hue: 42  },
  { label: '라임',   hue: 85  },
  { label: '민트',   hue: 155 },
  { label: '청록',   hue: 178 },
  { label: '하늘',   hue: 205 },
  { label: '라벤더', hue: 255 },
  { label: '보라',   hue: 285 },
]

interface Props { entries: Entry[] }

export function SettingsPage({ entries }: Props) {
  const today = todayKey()
  const { entries: moodEntries } = useMoodRecords()
  const { habits } = useRoutine()
  const { retros, deleteAll: deleteAllRetros } = useRetrospect()
  const { records: dietRecords } = useDiet()
  const { settings, setFont, setAccentHue, setRadius, setFontSize, reset } = useDesign()
  const [preset, setPreset] = useState<RangePreset>('1d')
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd] = useState(today)
  const [exporting, setExporting] = useState(false)
  const [asZip, setAsZip] = useState(false)
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
  const [deleteRetroConfirm, setDeleteRetroConfirm] = useState(false)
  const [deleteRetroDone, setDeleteRetroDone] = useState(false)
  const [deleteDietConfirm, setDeleteDietConfirm] = useState(false)
  const [deleteDietDone, setDeleteDietDone] = useState(false)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)
  const [deleteAllDone, setDeleteAllDone] = useState(false)
  const [backupExporting, setBackupExporting] = useState(false)
  const [backupImporting, setBackupImporting] = useState(false)
  const [importStrategy, setImportStrategy] = useState<MergeStrategy>('merge')
  const [importResult, setImportResult] = useState<{ entryCount: number; imageCount: number } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [deviceNote, setDeviceNote] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    try { setResult(await exportEntries(entries, moodEntries, habits, retros, startDate, endDate, asZip)) }
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

  const handleDeleteRetro = () => {
    if (!deleteRetroConfirm) { setDeleteRetroConfirm(true); return }
    deleteAllRetros()
    setDeleteRetroDone(true); setDeleteRetroConfirm(false)
    setTimeout(() => setDeleteRetroDone(false), 2000)
  }

  const handleDeleteDiet = () => {
    if (!deleteDietConfirm) { setDeleteDietConfirm(true); return }
    localStorage.removeItem('vestori:diet')
    setDeleteDietDone(true); setDeleteDietConfirm(false)
    setTimeout(() => { setDeleteDietDone(false); window.location.reload() }, 2000)
  }

  const handleDeleteAll = () => {
    if (!deleteAllConfirm) { setDeleteAllConfirm(true); return }
    ;['vestori:entries', 'vestori:moods', 'vestori:habits', 'vestori:checks',
      'vestori:retrospects', 'vestori:diet', 'vestori:design', 'vestori:threads'].forEach(k => localStorage.removeItem(k))
    setDeleteAllDone(true); setDeleteAllConfirm(false)
    setTimeout(() => { setDeleteAllDone(false); window.location.reload() }, 2000)
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
                className={`btn-sm btn-on`}>
                <span className="text-xl leading-none" style={{ fontFamily: family }}>Aa</span>
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>대표 색상</Label>
          <div className="flex gap-2 flex-wrap mb-3">
            {HUE_PRESETS.map(({ label, hue }) => (
              <button key={hue} onClick={() => setAccentHue(hue)}
                title={label}
                className={`flex flex-col items-center gap-1 cursor-pointer border-none bg-none p-0 group`}>
                <span className={`w-9 h-9 rounded-full flex-shrink-0 transition-all ring-offset-2
                  ${settings.accentHue === hue ? 'ring-2 ring-accent scale-110' : 'hover:scale-105 ring-0'}`}
                  style={{ background: `hsl(${hue}, 55%, 78%)` }} />
                <span className="text-xs text-ink-faint">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-paper-card border border-paper-border rounded-sm px-4 py-3">
            <label className="text-xs text-ink-muted flex-shrink-0">커스텀</label>
            <input type="range" min={0} max={360} value={settings.accentHue} onChange={e => setAccentHue(Number(e.target.value))}
              className="flex-1 accent-[var(--color-accent)]" />
            <div className="w-6 h-6 rounded-full flex-shrink-0 border border-black/10" style={{ background: `hsl(${settings.accentHue}, 55%, 78%)` }} />
          </div>
        </div>

        {/* 라운드 */}
        <div>
          <Label>모서리 둥글기</Label>
          <div className="flex items-center gap-3 bg-paper-card border border-paper-border rounded-sm px-4 py-3">
            <span className="text-sm text-ink-faint flex-shrink-0">각짐</span>
            <input type="range" min={0} max={12} step={1} value={settings.radius ?? 3}
              onChange={e => setRadius(Number(e.target.value))}
              className="flex-1 accent-[var(--color-accent)]" />
            <span className="text-sm text-ink-faint flex-shrink-0">둥글</span>
            <div className="w-6 h-6 bg-ink/15 flex-shrink-0 border border-ink/20"
              style={{ borderRadius: `${settings.radius ?? 3}px` }} />
          </div>
        </div>

        {/* 폰트 크기 */}
        <div>
          <Label>글자 크기</Label>
          <div className="flex items-center gap-3 bg-paper-card border border-paper-border rounded-sm px-4 py-3">
            <span className="text-sm text-ink-faint flex-shrink-0">작게</span>
            <input type="range" min={0.85} max={1.2} step={0.05} value={settings.fontSize ?? 1}
              onChange={e => setFontSize(Number(e.target.value))}
              className="flex-1 accent-[var(--color-accent)]" />
            <span className="text-sm text-ink-faint flex-shrink-0">크게</span>
            <span className="text-sm text-ink-muted flex-shrink-0 w-8 text-right">{Math.round((settings.fontSize ?? 1) * 100)}%</span>
          </div>
        </div>

        <button onClick={reset} className="mt-4 text-sm text-ink-faint hover:text-ink-muted border-none bg-none p-0 cursor-pointer transition-colors">기본값으로 초기화</button>
      </section>

      {/* ── 내보내기 ── */}
      <section>
        <SectionTitle>마크다운으로 내보내기</SectionTitle>
        <div className="mb-4">
          <Label>기간 선택</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(({ id, label }) => (
              <button key={id} onClick={() => setPreset(id)}
                className={`btn-sm btn-on`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-3 mb-4 p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex flex-col gap-1 flex-1">
              <Label>시작일</Label>
              <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)}
                className="text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
            </div>
            <span className="text-xs text-ink-faint mt-5">—</span>
            <div className="flex flex-col gap-1 flex-1">
              <Label>종료일</Label>
              <input type="date" value={customEnd} min={customStart} max={today} onChange={e => setCustomEnd(e.target.value)}
                className="text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
            </div>
          </div>
        )}

        <div className="p-4 bg-paper-card border border-paper-border rounded-sm mb-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
          <p className="text-xs text-ink-faint mb-1">내보낼 내용</p>
          <p className="text-sm text-ink">
            {startDate === endDate
              ? <><span className="text-accent">{formatDateDot(startDate)}</span> 하루</>
              : <><span className="text-accent">{formatDateDot(startDate)}</span> ~ <span className="text-accent">{formatDateDot(endDate)}</span></>}
          </p>
          <p className="text-xs text-ink-faint mt-1">
            {previewCount > 0 ? <><span className="text-ink-muted">{previewCount}개</span>의 기록</> : '해당 기간에 기록이 없어요'}
          </p>
        </div>

        <div className="flex items-center gap-3 py-2">
          <button onClick={() => setAsZip(false)}
            className={`btn-sm ${!asZip ? 'btn-on' : 'btn-off'}`}>파일별로</button>
          <button onClick={() => setAsZip(true)}
            className={`btn-sm ${asZip ? 'btn-on' : 'btn-off'}`}>📦 압축 파일</button>
          <span className="text-sm text-ink-faint">{asZip ? 'vestori-날짜.zip' : '파일마다 개별 다운로드'}</span>
        </div>

        <button onClick={handleExport} disabled={exporting || previewCount === 0}
          className="w-full bg-ink text-white text-sm py-3 rounded-sm hover:opacity-75 transition-colors disabled:opacity-40 cursor-pointer">
          {exporting ? '내보내는 중...' : `${previewCount}개 기록 내보내기`}
        </button>
        {result && <div className="mt-3 p-3 bg-ink/8 border border-ink/15 rounded-sm"><p className="text-xs text-ink">✓ {result.dayCount}일 · {result.fileCount}개 파일 완료</p></div>}
        {exportError && <p className="mt-3 text-sm text-red-400">{exportError}</p>}
      </section>

      {/* ── 데이터 ── */}
      <section>
        <SectionTitle>데이터</SectionTitle>
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-ink-muted mb-0.5">기록 (localStorage)</p>
                <p className="text-xs text-ink-faint"><span className="text-accent">{entries.length}개</span>의 기록</p>
              </div>
              {entries.length > 0 && (
                <button onClick={handleDeleteAllEntries}
                  className={`text-xs px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteEntriesConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-ink/30'}`}>
                  {deleteEntriesConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteEntriesConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-red-400 flex-1">모든 기록이 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteEntriesConfirm(false)} className="text-xs text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteEntriesDone && <p className="text-xs text-ink mt-1">✓ 모든 기록이 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-ink-muted mb-0.5">이미지 (IndexedDB)</p>
                <p className="text-xs text-ink-faint">
                  {imageCount > 0 ? <><span className="text-accent">{imageCount}장</span> · {imageSize !== null ? formatBytes(imageSize) : '계산 중...'}</> : '저장된 이미지 없음'}
                </p>
              </div>
              {imageCount > 0 && (
                <button onClick={handleClearDB}
                  className={`text-xs px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${clearConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-ink/30'}`}>
                  {clearConfirm ? '정말 삭제할게요' : '전체 삭제'}
                </button>
              )}
            </div>
            {clearConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-red-400 flex-1">모든 이미지가 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setClearConfirm(false)} className="text-xs text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {clearDone && <p className="text-xs text-ink mt-1">✓ 이미지가 모두 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-ink-muted mb-0.5">기분 기록</p>
                <p className="text-xs text-ink-faint"><span className="text-accent">{entries.length}개</span>의 기분 기록</p>
              </div>
              {Object.keys(moodEntries).length > 0 && (
                <button onClick={handleDeleteMood}
                  className={`text-xs px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteMoodConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-ink/30'}`}>
                  {deleteMoodConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteMoodConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-red-400 flex-1">모든 기분 기록이 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteMoodConfirm(false)} className="text-xs text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteMoodDone && <p className="text-xs text-ink mt-1">✓ 모든 기분 기록이 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-ink-muted mb-0.5">루틴</p>
                <p className="text-xs text-ink-faint"><span className="text-accent">{habits.length}개</span>의 루틴</p>
              </div>
              {habits.length > 0 && (
                <button onClick={handleDeleteRoutine}
                  className={`text-xs px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteRoutineConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-ink/30'}`}>
                  {deleteRoutineConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteRoutineConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-red-400 flex-1">모든 루틴이 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteRoutineConfirm(false)} className="text-xs text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteRoutineDone && <p className="text-xs text-ink mt-1">✓ 모든 루틴이 삭제됐어요</p>}
          </div>
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-ink-muted mb-0.5">회고</p>
                <p className="text-xs text-ink-faint"><span className="text-accent">{Object.keys(retros).length}개</span>의 회고</p>
              </div>
              {Object.keys(retros).length > 0 && (
                <button onClick={handleDeleteRetro}
                  className={`text-xs px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${deleteRetroConfirm ? 'border-red-400 bg-red-50 text-red-500' : 'border-paper-border text-ink-faint hover:border-ink/30'}`}>
                  {deleteRetroConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteRetroConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-red-400 flex-1">모든 회고가 영구 삭제돼요. 되돌릴 수 없어요.</p>
                <button onClick={() => setDeleteRetroConfirm(false)} className="text-xs text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteRetroDone && <p className="text-xs text-ink mt-1">✓ 모든 회고가 삭제됐어요</p>}
          </div>

          {/* 식단 */}
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-ink-muted mb-0.5">식단</p>
                <p className="text-sm text-ink-faint"><span className="text-ink-muted">{Object.keys(dietRecords).length}일</span>의 식단 기록</p>
              </div>
              {Object.keys(dietRecords).length > 0 && (
                <button onClick={handleDeleteDiet}
                  className={`btn-sm ${deleteDietConfirm ? 'border-red-400 text-red-500' : 'btn-off'}`}>
                  {deleteDietConfirm ? '정말 삭제' : '전체 삭제'}
                </button>
              )}
            </div>
            {deleteDietConfirm && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-red-400 flex-1">모든 식단 기록이 영구 삭제돼요.</p>
                <button onClick={() => setDeleteDietConfirm(false)} className="text-sm text-ink-faint cursor-pointer border-none bg-none">취소</button>
              </div>
            )}
            {deleteDietDone && <p className="text-sm text-ink-muted mt-1">✓ 식단 기록이 삭제됐어요</p>}
          </div>
        </div>
      </section>

      {/* 백업 & 가져오기 */}
      <section>
        <SectionTitle>백업 / 가져오기</SectionTitle>
        <div className="flex flex-col gap-3">

          {/* 백업 내보내기 */}
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm flex flex-col gap-3">
            <div>
              <p className="text-base text-ink mb-0.5">백업 내보내기</p>
              <p className="text-sm text-ink-faint">모든 기록·사진·설정을 하나의 파일로 저장해요</p>
            </div>
            <input type="text" value={deviceNote} onChange={e => setDeviceNote(e.target.value)}
              placeholder="기기 메모 (예: 아이패드, 선택사항)"
              className="w-full border border-paper-border rounded-sm px-3 py-2 text-sm outline-none focus:border-ink/30" />
            <button onClick={async () => {
              setBackupExporting(true)
              try { await exportBackup(deviceNote) }
              finally { setBackupExporting(false) }
            }} disabled={backupExporting} className="btn-primary w-full">
              {backupExporting ? '백업 파일 생성 중...' : '📦 .json 백업 파일 내보내기'}
            </button>
          </div>

          {/* 가져오기 */}
          <div className="p-4 bg-paper-card border border-paper-border rounded-sm flex flex-col gap-3">
            <div>
              <p className="text-base text-ink mb-0.5">가져오기</p>
              <p className="text-sm text-ink-faint">다른 기기에서 내보낸 .json 백업 파일을 불러와요</p>
            </div>

            {/* 병합 방식 */}
            <div className="flex gap-2">
              <button onClick={() => setImportStrategy('merge')}
                className={`btn-sm ${importStrategy === 'merge' ? 'btn-on' : 'btn-off'} flex-1`}>
                합치기
              </button>
              <button onClick={() => setImportStrategy('overwrite')}
                className={`btn-sm ${importStrategy === 'overwrite' ? 'btn-on' : 'btn-off'} flex-1`}>
                덮어쓰기
              </button>
            </div>
            <p className="text-sm text-ink-faint -mt-1">
              {importStrategy === 'merge'
                ? '기존 데이터를 유지하고 새 데이터를 추가해요'
                : '⚠ 기존 데이터를 모두 지우고 백업으로 교체해요'}
            </p>

            <input ref={fileInputRef} type="file" accept=".json" className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                setBackupImporting(true)
                setImportError(null)
                setImportResult(null)
                try {
                  const result = await importBackup(file, importStrategy)
                  setImportResult(result)
                  setTimeout(() => window.location.reload(), 1500)
                } catch (err: any) {
                  setImportError(err.message ?? '가져오기 중 오류가 발생했어요')
                } finally {
                  setBackupImporting(false)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }
              }} />

            <button onClick={() => fileInputRef.current?.click()}
              disabled={backupImporting}
              className="btn-primary w-full">
              {backupImporting ? '가져오는 중...' : '📂 백업 파일 선택'}
            </button>

            {importResult && (
              <p className="text-sm text-ink-muted">✓ 가져오기 완료 · 잠시 후 새로고침됩니다</p>
            )}
            {importError && <p className="text-sm text-red-400">{importError}</p>}
          </div>
        </div>
      </section>

      {/* 전체 데이터 삭제 */}
      <section>
        <SectionTitle>위험 구역</SectionTitle>
        <div className="p-4 bg-paper-card border border-paper-border rounded-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm text-ink-muted mb-0.5">전체 데이터 삭제</p>
              <p className="text-sm text-ink-faint">기록, 기분, 루틴, 식단, 회고, 설정 모두</p>
            </div>
            <button onClick={handleDeleteAll}
              className={`btn-sm ${deleteAllConfirm ? 'border-red-400 text-red-500' : 'border-red-300 text-red-400'}`}>
              {deleteAllConfirm ? '정말요?' : '전체 삭제'}
            </button>
          </div>
          {deleteAllConfirm && (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-red-400 flex-1">앱의 모든 데이터가 영구 삭제됩니다. 되돌릴 수 없어요.</p>
              <button onClick={() => setDeleteAllConfirm(false)} className="text-sm text-ink-faint cursor-pointer border-none bg-none">취소</button>
            </div>
          )}
          {deleteAllDone && <p className="text-sm text-red-400 mt-1">✓ 모든 데이터가 삭제됐어요</p>}
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <h3 className="text-base italic text-ink whitespace-nowrap">{children}</h3>
      <div className="flex-1 h-px bg-paper-border" />
    </div>
  )
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-faint tracking-wide mb-2">{children}</p>
}
