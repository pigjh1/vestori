import { useState, useEffect, useRef } from 'react'
import type { Entry, FontFamily } from '@/types'
import { exportEntries, type ExportResult } from '@/utils/exportMd'
import { exportBackup, importBackup, type MergeStrategy } from '@/utils/backup'
import { clearAllImages, getStorageSize } from '@/lib/imageDB'
import { useDesign } from '@/hooks/useDesign'
import { useProfile } from '@/hooks/useProfile'
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
  const { profile, update: updateProfile } = useProfile()
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

  const [settingsTab, setSettingsTab] = useState<'profile' | 'design' | 'export' | 'data'>('profile')

  return (
    <div>
      {/* 탭 */}
      <div className="tab-bar mb-6">
        {([
          { id: 'profile', label: '내 정보' },
          { id: 'design',  label: '꾸미기' },
          { id: 'export',  label: '내보내기' },
          { id: 'data',    label: '데이터' },
        ] as const).map(({ id, label }) => (
          <button key={id} onClick={() => setSettingsTab(id)}
            className={`tab flex-1 text-center ${settingsTab === id ? 'tab-on' : 'tab-off'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 내 정보 탭 ── */}
      {settingsTab === 'profile' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">닉네임</label>
            <input type="text" value={profile.nickname} maxLength={20}
              onChange={e => updateProfile({ nickname: e.target.value })}
              placeholder="나를 부를 이름"
              className="border border-paper-border rounded-sm px-3 py-2.5 outline-none focus:border-ink/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">한 마디로</label>
            <input type="text" value={profile.tagline} maxLength={80}
              onChange={e => updateProfile({ tagline: e.target.value })}
              placeholder="나를 표현하는 한 문장 (좌우명, 소개 등)"
              className="border border-paper-border rounded-sm px-3 py-2.5 outline-none focus:border-ink/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">관심사 / 취미</label>
            <input type="text" value={profile.interests} maxLength={100}
              onChange={e => updateProfile({ interests: e.target.value })}
              placeholder="예: 독서, 사진, 산책, 요리"
              className="border border-paper-border rounded-sm px-3 py-2.5 outline-none focus:border-ink/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">올해의 목표</label>
            <input type="text" value={profile.yearlyGoal} maxLength={100}
              onChange={e => updateProfile({ yearlyGoal: e.target.value })}
              placeholder="올해 꼭 이루고 싶은 것"
              className="border border-paper-border rounded-sm px-3 py-2.5 outline-none focus:border-ink/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-muted">지금 집중하는 것</label>
            <input type="text" value={profile.currentFocus} maxLength={100}
              onChange={e => updateProfile({ currentFocus: e.target.value })}
              placeholder="요즘 가장 신경 쓰는 것"
              className="border border-paper-border rounded-sm px-3 py-2.5 outline-none focus:border-ink/30" />
          </div>
        </div>
      )}

      {/* ── 꾸미기 탭 ── */}
      {settingsTab === 'design' && (
        <div className="flex flex-col gap-6">

          <div>
            <Label>글꼴</Label>
            <div className="flex gap-2 flex-wrap">
              {FONT_OPTIONS.map(({ id, label, family }) => (
                <button key={id} onClick={() => setFont(id)}
                  className={`btn-sm ${settings.font === id ? 'btn-on' : 'btn-off'} flex flex-col items-center gap-1`}>
                  <span className="text-lg leading-none" style={{ fontFamily: family }}>Aa</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>대표 색상</Label>
            <div className="flex gap-2 flex-wrap mb-3">
              {HUE_PRESETS.map(({ label, hue }) => (
                <button key={hue} onClick={() => setAccentHue(hue)} title={label}
                  className="flex flex-col items-center gap-1 cursor-pointer border-none bg-none p-0">
                  <span className={`w-8 h-8 rounded-full transition-all ring-offset-2
                    ${settings.accentHue === hue ? 'ring-2 ring-accent scale-110' : 'hover:scale-105'}`}
                    style={{ background: `hsl(${hue}, 55%, 78%)` }} />
                  <span className="text-xs text-ink-faint">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-paper-card border border-paper-border rounded-sm px-4 py-3">
              <span className="text-sm text-ink-faint flex-shrink-0">커스텀</span>
              <input type="range" min={0} max={360} value={settings.accentHue} onChange={e => setAccentHue(Number(e.target.value))}
                className="flex-1 accent-[var(--color-accent)]" />
              <div className="w-6 h-6 rounded-full flex-shrink-0 border border-black/10" style={{ background: `hsl(${settings.accentHue}, 55%, 78%)` }} />
            </div>
          </div>

          <div>
            <Label>모서리 둥글기</Label>
            <div className="flex items-center gap-3 bg-paper-card border border-paper-border rounded-sm px-4 py-3">
              <span className="text-sm text-ink-faint flex-shrink-0">각짐</span>
              <input type="range" min={0} max={12} step={1} value={settings.radius ?? 3}
                onChange={e => setRadius(Number(e.target.value))} className="flex-1 accent-[var(--color-accent)]" />
              <span className="text-sm text-ink-faint flex-shrink-0">둥글</span>
              <div className="w-6 h-6 bg-ink/10 flex-shrink-0 border border-ink/15"
                style={{ borderRadius: `${settings.radius ?? 3}px` }} />
            </div>
          </div>

          <div>
            <Label>글자 크기</Label>
            <div className="flex items-center gap-3 bg-paper-card border border-paper-border rounded-sm px-4 py-3">
              <span className="text-sm text-ink-faint flex-shrink-0">작게</span>
              <input type="range" min={0.85} max={1.2} step={0.05} value={settings.fontSize ?? 1}
                onChange={e => setFontSize(Number(e.target.value))} className="flex-1 accent-[var(--color-accent)]" />
              <span className="text-sm text-ink-faint flex-shrink-0">크게</span>
              <span className="text-sm text-ink-muted flex-shrink-0 w-9 text-right">{Math.round((settings.fontSize ?? 1) * 100)}%</span>
            </div>
          </div>

          <button onClick={reset} className="text-sm text-ink-faint hover:text-ink-muted border-none bg-none p-0 cursor-pointer transition-colors self-start">
            기본값으로 초기화
          </button>
        </div>
      )}

      {/* ── 내보내기 탭 ── */}
      {settingsTab === 'export' && (
        <div className="flex flex-col gap-8">

          {/* 마크다운 */}
          <div>
            <Label>마크다운 내보내기</Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(({ id, label }) => (
                  <button key={id} onClick={() => setPreset(id)}
                    className={`btn-sm ${preset === id ? 'btn-on' : 'btn-off'}`}>{label}</button>
                ))}
              </div>
              {preset === 'custom' && (
                <div className="flex items-center gap-3 p-4 bg-paper-card border border-paper-border rounded-sm">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm text-ink-faint">시작일</span>
                    <input type="date" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)}
                      className="border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30" />
                  </div>
                  <span className="text-sm text-ink-faint mt-5">—</span>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm text-ink-faint">종료일</span>
                    <input type="date" value={customEnd} min={customStart} max={today} onChange={e => setCustomEnd(e.target.value)}
                      className="border border-paper-border rounded-sm px-3 py-1.5 outline-none focus:border-ink/30" />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-3 bg-paper-card border border-paper-border rounded-sm">
                <div className="w-1 self-stretch bg-accent rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-ink">
                    {startDate === endDate ? formatDateDot(startDate) : `${formatDateDot(startDate)} ~ ${formatDateDot(endDate)}`}
                  </p>
                  <p className="text-sm text-ink-faint">{previewCount > 0 ? `${previewCount}개의 기록` : '해당 기간에 기록이 없어요'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAsZip(false)} className={`btn-sm ${!asZip ? 'btn-on' : 'btn-off'} flex-1`}>파일별로</button>
                <button onClick={() => setAsZip(true)} className={`btn-sm ${asZip ? 'btn-on' : 'btn-off'} flex-1`}>압축(.zip)</button>
              </div>
              <button onClick={handleExport} disabled={exporting || previewCount === 0} className="btn-primary w-full">
                {exporting ? '내보내는 중...' : `${previewCount}개 기록 내보내기`}
              </button>
              {result && <p className="text-sm text-ink-muted">✓ {result.dayCount}일 · {result.fileCount}개 파일 완료</p>}
              {exportError && <p className="text-sm text-red-400">{exportError}</p>}
            </div>
          </div>

          {/* 백업 */}
          <div>
            <Label>백업 내보내기</Label>
            <div className="p-4 bg-paper-card border border-paper-border rounded-sm flex flex-col gap-3">
              <p className="text-sm text-ink-faint">모든 기록·사진·설정을 하나의 .json 파일로 저장해요</p>
              <input type="text" value={deviceNote} onChange={e => setDeviceNote(e.target.value)}
                placeholder="기기 메모 (예: 아이패드, 선택사항)"
                className="border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-ink/30" />
              <button onClick={async () => {
                setBackupExporting(true)
                try { await exportBackup(deviceNote) }
                finally { setBackupExporting(false) }
              }} disabled={backupExporting} className="btn-primary w-full">
                {backupExporting ? '생성 중...' : '백업 파일 내보내기'}
              </button>
            </div>
          </div>

          {/* 가져오기 */}
          <div>
            <Label>가져오기</Label>
            <div className="p-4 bg-paper-card border border-paper-border rounded-sm flex flex-col gap-3">
              <p className="text-sm text-ink-faint">다른 기기의 .json 백업 파일을 불러와요</p>
              <div className="flex gap-2">
                <button onClick={() => setImportStrategy('merge')} className={`btn-sm ${importStrategy === 'merge' ? 'btn-on' : 'btn-off'} flex-1`}>합치기</button>
                <button onClick={() => setImportStrategy('overwrite')} className={`btn-sm ${importStrategy === 'overwrite' ? 'btn-on' : 'btn-off'} flex-1`}>덮어쓰기</button>
              </div>
              <p className="text-sm text-ink-faint -mt-1">
                {importStrategy === 'merge' ? '기존 데이터 유지 + 새 데이터 추가' : '⚠ 기존 데이터를 모두 백업으로 교체'}
              </p>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBackupImporting(true); setImportError(null); setImportResult(null)
                  try {
                    const r = await importBackup(file, importStrategy)
                    setImportResult(r)
                    setTimeout(() => window.location.reload(), 1500)
                  } catch (err: any) {
                    setImportError(err.message ?? '가져오기 중 오류 발생')
                  } finally {
                    setBackupImporting(false)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }
                }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={backupImporting} className="btn-primary w-full">
                {backupImporting ? '가져오는 중...' : '백업 파일 선택'}
              </button>
              {importResult && <p className="text-sm text-ink-muted">✓ 완료 · 잠시 후 새로고침됩니다</p>}
              {importError && <p className="text-sm text-red-400">{importError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── 데이터 탭 ── */}
      {settingsTab === 'data' && (
        <div className="flex flex-col gap-3">
          {/* 데이터 항목 행 */}
          {[
            { label: '기록', count: `${entries.length}개`, onDelete: handleDeleteAllEntries, confirm: deleteEntriesConfirm, onCancel: () => setDeleteEntriesConfirm(false), done: deleteEntriesDone, show: entries.length > 0 },
            { label: '사진', count: imageCount > 0 ? `${imageCount}장 · ${imageSize !== null ? formatBytes(imageSize) : ''}` : '없음', onDelete: handleClearDB, confirm: clearConfirm, onCancel: () => setClearConfirm(false), done: clearDone, show: imageCount > 0 },
            { label: '기분', count: `${moodEntries.length}개`, onDelete: handleDeleteMood, confirm: deleteMoodConfirm, onCancel: () => setDeleteMoodConfirm(false), done: deleteMoodDone, show: moodEntries.length > 0 },
            { label: '루틴', count: `${habits.length}개`, onDelete: handleDeleteRoutine, confirm: deleteRoutineConfirm, onCancel: () => setDeleteRoutineConfirm(false), done: deleteRoutineDone, show: habits.length > 0 },
            { label: '식단', count: `${Object.keys(dietRecords).length}일`, onDelete: handleDeleteDiet, confirm: deleteDietConfirm, onCancel: () => setDeleteDietConfirm(false), done: deleteDietDone, show: Object.keys(dietRecords).length > 0 },
            { label: '회고', count: `${Object.keys(retros).length}개`, onDelete: handleDeleteRetro, confirm: deleteRetroConfirm, onCancel: () => setDeleteRetroConfirm(false), done: deleteRetroDone, show: Object.keys(retros).length > 0 },
          ].map(({ label, count, onDelete, confirm, onCancel, done, show }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 bg-paper-card border border-paper-border rounded-sm">
              <span className="text-sm text-ink-muted w-14 flex-shrink-0">{label}</span>
              <span className="text-sm text-ink-faint flex-1">{count}</span>
              {done && <span className="text-sm text-ink-faint">✓</span>}
              {confirm && <button onClick={onCancel} className="text-sm text-ink-faint cursor-pointer border-none bg-none">취소</button>}
              {show && (
                <button onClick={onDelete}
                  className={`text-sm flex-shrink-0 cursor-pointer border-none bg-none transition-colors ${confirm ? 'text-red-400 font-medium' : 'text-ink-faint hover:text-ink-muted'}`}>
                  {confirm ? '정말 삭제' : '삭제'}
                </button>
              )}
            </div>
          ))}

          {/* 전체 삭제 */}
          <div className="mt-4 flex items-center gap-3 px-4 py-3 border border-red-200 rounded-sm bg-paper-card">
            <div className="flex-1">
              <p className="text-sm text-ink-muted">전체 삭제</p>
              {deleteAllConfirm && <p className="text-sm text-red-400 mt-0.5">모든 데이터가 영구 삭제됩니다</p>}
            </div>
            {deleteAllConfirm && <button onClick={() => setDeleteAllConfirm(false)} className="text-sm text-ink-faint cursor-pointer border-none bg-none">취소</button>}
            {deleteAllDone && <span className="text-sm text-red-400">✓ 삭제됨</span>}
            <button onClick={handleDeleteAll}
              className={`text-sm cursor-pointer border-none bg-none transition-colors flex-shrink-0 ${deleteAllConfirm ? 'text-red-400 font-medium' : 'text-red-300 hover:text-red-400'}`}>
              {deleteAllConfirm ? '정말 삭제' : '전체 삭제'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-faint tracking-wide mb-2">{children}</p>
}
