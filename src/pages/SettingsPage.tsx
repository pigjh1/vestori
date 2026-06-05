import { useState, useEffect } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns'
import type { Entry } from '@/types'
import { exportEntries, type ExportResult } from '@/utils/exportMd'
import { clearAllImages, getStorageSize } from '@/lib/imageDB'

interface SettingsPageProps {
  entries: Entry[]
}

type RangePreset = '1d' | '7d' | '30d' | 'month' | 'year' | 'custom'

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: '1d',     label: '오늘' },
  { id: '7d',     label: '최근 7일' },
  { id: '30d',    label: '최근 30일' },
  { id: 'month',  label: '이번 달' },
  { id: 'year',   label: '올해 전체' },
  { id: 'custom', label: '직접 설정' },
]

function getRange(preset: RangePreset, customStart: string, customEnd: string): [string, string] {
  const today = format(new Date(), 'yyyy-MM-dd')
  switch (preset) {
    case '1d':     return [today, today]
    case '7d':     return [format(subDays(new Date(), 6), 'yyyy-MM-dd'), today]
    case '30d':    return [format(subDays(new Date(), 29), 'yyyy-MM-dd'), today]
    case 'month':  return [format(startOfMonth(new Date()), 'yyyy-MM-dd'), format(endOfMonth(new Date()), 'yyyy-MM-dd')]
    case 'year':   return [format(startOfYear(new Date()), 'yyyy-MM-dd'), today]
    case 'custom': return [customStart, customEnd]
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function SettingsPage({ entries }: SettingsPageProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [preset, setPreset] = useState<RangePreset>('1d')
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd] = useState(today)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  // IndexedDB 상태
  const [imageSize, setImageSize] = useState<number | null>(null)
  const [imageCount, setImageCount] = useState<number>(0)
  const [clearingDB, setClearingDB] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearDone, setClearDone] = useState(false)

  useEffect(() => {
    getStorageSize().then(size => {
      setImageSize(size)
      // 이미지 총 개수
      const count = entries.reduce((s, e) => s + e.imageIds.length, 0)
      setImageCount(count)
    })
  }, [entries])

  const [startDate, endDate] = getRange(preset, customStart, customEnd)

  const previewCount = entries.filter(e => {
    const d = format(new Date(e.createdAt), 'yyyy-MM-dd')
    return d >= startDate && d <= endDate
  }).length

  const handleExport = async () => {
    if (previewCount === 0) return
    setExporting(true); setResult(null); setExportError(null)
    try {
      const res = await exportEntries(entries, startDate, endDate)
      setResult(res)
    } catch {
      setExportError('내보내기 중 오류가 발생했어요.')
    } finally {
      setExporting(false)
    }
  }

  const handleClearDB = async () => {
    if (!clearConfirm) { setClearConfirm(true); return }
    setClearingDB(true)
    try {
      await clearAllImages()
      setImageSize(0); setImageCount(0)
      setClearDone(true)
      setTimeout(() => setClearDone(false), 3000)
    } finally {
      setClearingDB(false); setClearConfirm(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 max-w-lg">

      {/* ── 내보내기 ── */}
      <section>
        <SectionTitle>마크다운으로 내보내기</SectionTitle>

        <div className="mb-4">
          <Label>기간 선택</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(({ id, label }) => (
              <button key={id} onClick={() => setPreset(id)}
                className={`font-sans text-[12px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                  ${preset === id ? 'border-accent bg-accent-pale text-accent' : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-3 mb-4 p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex flex-col gap-1 flex-1">
              <Label>시작일</Label>
              <input type="date" value={customStart} max={customEnd}
                onChange={e => setCustomStart(e.target.value)}
                className="font-sans text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-accent-light transition-colors" />
            </div>
            <span className="font-sans text-[12px] text-ink-faint mt-5">—</span>
            <div className="flex flex-col gap-1 flex-1">
              <Label>종료일</Label>
              <input type="date" value={customEnd} min={customStart} max={today}
                onChange={e => setCustomEnd(e.target.value)}
                className="font-sans text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-2 outline-none focus:border-accent-light transition-colors" />
            </div>
          </div>
        )}

        <div className="p-4 bg-white border border-paper-border rounded-sm mb-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />
          <p className="font-sans text-[11px] text-ink-faint font-light mb-1">내보낼 내용</p>
          <p className="font-body text-[14px] text-ink">
            {startDate === endDate
              ? <><span className="text-accent">{startDate.replace(/-/g, '.')}</span> 하루</>
              : <><span className="text-accent">{startDate.replace(/-/g, '.')}</span> ~ <span className="text-accent">{endDate.replace(/-/g, '.')}</span></>
            }
          </p>
          <p className="font-sans text-[11px] text-ink-faint mt-1">
            {previewCount > 0
              ? <><span className="text-ink-muted">{previewCount}개</span>의 기록 · 날짜별 .md 파일 (이미지 포함)</>
              : '해당 기간에 기록이 없어요'}
          </p>
        </div>

        <div className="p-4 bg-paper-warm border border-paper-border rounded-sm mb-5 font-sans text-[11px] text-ink-faint leading-[1.9]">
          <p className="text-ink-muted mb-1 font-light">파일 구조</p>
          <p>📄 <code className="text-accent">2025.06.30.월.md</code> — 미분류 기록</p>
          <p>📄 <code className="text-accent">2025.06.30.월.음식.md</code> — 카테고리별</p>
          <p className="mt-1 text-ink-faint/70">이미지는 base64로 마크다운에 포함돼요</p>
        </div>

        <button onClick={handleExport} disabled={exporting || previewCount === 0}
          className="w-full bg-ink text-white font-sans text-[13px] py-3 rounded-sm
            hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-default cursor-pointer">
          {exporting ? '내보내는 중...' : `${previewCount}개 기록 내보내기`}
        </button>

        {result && (
          <div className="mt-3 p-3 bg-accent-pale border border-accent/20 rounded-sm">
            <p className="font-sans text-[12px] text-accent">✓ {result.dayCount}일 · {result.fileCount}개 파일 다운로드 완료</p>
          </div>
        )}
        {exportError && <p className="mt-3 font-sans text-[12px] text-red-400">{exportError}</p>}
      </section>

      {/* ── 데이터 ── */}
      <section>
        <SectionTitle>데이터</SectionTitle>
        <div className="flex flex-col gap-3">

          {/* localStorage */}
          <div className="p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-[12px] text-ink-muted font-light mb-0.5">기록 (localStorage)</p>
                <p className="font-sans text-[11px] text-ink-faint font-light">
                  <span className="text-accent">{entries.length}개</span>의 기록이 저장되어 있어요
                </p>
              </div>
            </div>
          </div>

          {/* IndexedDB */}
          <div className="p-4 bg-white border border-paper-border rounded-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-sans text-[12px] text-ink-muted font-light mb-0.5">이미지 (IndexedDB)</p>
                <p className="font-sans text-[11px] text-ink-faint font-light">
                  {imageCount > 0
                    ? <><span className="text-accent">{imageCount}장</span> · {imageSize !== null ? formatBytes(imageSize) : '계산 중...'}</>
                    : '저장된 이미지 없음'}
                </p>
              </div>
              {imageCount > 0 && (
                <button
                  onClick={handleClearDB}
                  disabled={clearingDB}
                  className={`font-sans text-[11px] px-3 py-1.5 rounded-sm border transition-all cursor-pointer
                    ${clearConfirm
                      ? 'border-red-400 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-paper-border text-ink-faint hover:border-accent-light hover:text-ink-muted'
                    } disabled:opacity-40`}
                >
                  {clearingDB ? '삭제 중...' : clearConfirm ? '정말 삭제할게요' : '전체 삭제'}
                </button>
              )}
            </div>

            {clearConfirm && !clearingDB && (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-sans text-[11px] text-red-400 flex-1">
                  모든 이미지가 삭제돼요. 되돌릴 수 없어요.
                </p>
                <button onClick={() => setClearConfirm(false)}
                  className="font-sans text-[11px] text-ink-faint hover:text-ink cursor-pointer border-none bg-none">
                  취소
                </button>
              </div>
            )}
            {clearDone && (
              <p className="font-sans text-[11px] text-accent mt-1">✓ 이미지가 모두 삭제됐어요</p>
            )}
          </div>

        </div>
      </section>

    </div>
  )
}

// ── 공통 컴포넌트 ──────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <h3 className="font-serif text-[16px] italic text-ink whitespace-nowrap">{children}</h3>
      <div className="flex-1 h-px bg-paper-border" />
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[11px] text-ink-faint font-light tracking-wide mb-2">{children}</p>
}
