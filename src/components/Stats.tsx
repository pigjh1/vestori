import { useMemo } from 'react'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Entry } from '@/types'
import { CATEGORIES } from '@/types'
import { getDateKey } from '@/utils/date'

interface StatsProps { entries: Entry[] }

export function Stats({ entries }: StatsProps) {
  const stats = useMemo(() => {
    if (entries.length === 0) return null

    // 총 기록 / 이번 달 / 이번 주
    const now = new Date()
    const thisMonth = entries.filter(e => {
      const d = new Date(e.createdAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    const thisWeek = entries.filter(e => new Date(e.createdAt) >= subDays(now, 7))

    // 최근 30일 히트맵 데이터
    const days30 = eachDayOfInterval({ start: subDays(now, 29), end: now })
    const countMap = entries.reduce<Record<string, number>>((acc, e) => {
      const k = getDateKey(e.createdAt); acc[k] = (acc[k] ?? 0) + 1; return acc
    }, {})
    const heatmap = days30.map(d => ({
      key: getDateKey(d.toISOString()),
      count: countMap[getDateKey(d.toISOString())] ?? 0,
      label: format(d, 'M/d', { locale: ko }),
    }))
    const maxCount = Math.max(...heatmap.map(h => h.count), 1)

    // 카테고리 분포
    const catCount = CATEGORIES.map(c => ({
      ...c,
      count: entries.filter(e => e.category === c.id).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)
    const uncategorized = entries.filter(e => !e.category).length

    // 태그 TOP 5
    const tagMap = entries.flatMap(e => e.tags).reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1; return acc
    }, {})
    const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

    // 가장 활발한 요일
    const dayMap = Array(7).fill(0) as number[]
    entries.forEach(e => { dayMap[new Date(e.createdAt).getDay()]++ })
    const DAYS = ['일', '월', '화', '수', '목', '금', '토']
    const maxDay = Math.max(...dayMap, 1)

    // 연속 기록일
    const uniqueDays = [...new Set(entries.map(e => getDateKey(e.createdAt)))].sort().reverse()
    let streak = 0
    let cursor = startOfDay(now)
    for (const d of uniqueDays) {
      if (d === getDateKey(cursor.toISOString())) {
        streak++; cursor = subDays(cursor, 1)
      } else break
    }

    return { thisMonth, thisWeek, heatmap, maxCount, catCount, uncategorized, topTags, dayMap, DAYS, maxDay, streak }
  }, [entries])

  if (!stats || entries.length === 0) return (
    <div className="text-center py-16">
      <div className="font-serif text-5xl italic text-paper-border leading-none mb-4">∿</div>
      <p className="font-body text-sm font-light text-ink-faint italic">기록이 쌓이면 통계가 보여요.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '전체 기록', value: entries.length },
          { label: '이번 달', value: stats.thisMonth.length },
          { label: '최근 7일', value: stats.thisWeek.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-paper-warm border border-paper-border rounded-sm p-4 text-center">
            <p className="font-serif text-[28px] italic text-accent leading-none mb-1">{value}</p>
            <p className="font-sans text-[11px] text-ink-faint font-light">{label}</p>
          </div>
        ))}
      </div>

      {/* 연속 기록 */}
      {stats.streak > 0 && (
        <div className="bg-white dark:bg-paper-warm border border-paper-border rounded-sm px-5 py-4 flex items-center gap-3">
          <span className="font-serif text-[22px] italic text-accent">{stats.streak}</span>
          <div>
            <p className="font-sans text-[12px] text-ink font-light">일 연속 기록 중</p>
            <p className="font-sans text-[11px] text-ink-faint font-light">오늘도 흔적을 남겨보세요</p>
          </div>
        </div>
      )}

      {/* 최근 30일 히트맵 */}
      <div className="bg-white dark:bg-paper-warm border border-paper-border rounded-sm p-5">
        <p className="font-sans text-[11px] text-ink-faint font-light mb-3 tracking-wide">최근 30일</p>
        <div className="flex gap-1 flex-wrap">
          {stats.heatmap.map(({ key, count, label }) => {
            const intensity = count === 0 ? 0 : Math.ceil((count / stats.maxCount) * 4)
            const bg = [
              'bg-paper-border',
              'bg-accent/20', 'bg-accent/40', 'bg-accent/65', 'bg-accent',
            ][intensity]
            return (
              <div key={key} title={`${label}: ${count}개`}
                className={`w-6 h-6 rounded-sm ${bg} transition-colors`} />
            )
          })}
        </div>
      </div>

      {/* 카테고리 분포 */}
      {stats.catCount.length > 0 && (
        <div className="bg-white dark:bg-paper-warm border border-paper-border rounded-sm p-5">
          <p className="font-sans text-[11px] text-ink-faint font-light mb-3 tracking-wide">카테고리</p>
          <div className="flex flex-col gap-2">
            {stats.catCount.map(({ id, label, count }) => (
              <div key={id} className="flex items-center gap-3">
                <span className="font-sans text-[12px] text-ink-muted font-light w-12">{label}</span>
                <div className="flex-1 h-1.5 bg-paper-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(count / entries.length) * 100}%` }} />
                </div>
                <span className="font-sans text-[11px] text-ink-faint w-6 text-right">{count}</span>
              </div>
            ))}
            {stats.uncategorized > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-sans text-[12px] text-ink-muted font-light w-12">미분류</span>
                <div className="flex-1 h-1.5 bg-paper-border rounded-full overflow-hidden">
                  <div className="h-full bg-ink-faint rounded-full"
                    style={{ width: `${(stats.uncategorized / entries.length) * 100}%` }} />
                </div>
                <span className="font-sans text-[11px] text-ink-faint w-6 text-right">{stats.uncategorized}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 요일별 활동 */}
      <div className="bg-white dark:bg-paper-warm border border-paper-border rounded-sm p-5">
        <p className="font-sans text-[11px] text-ink-faint font-light mb-3 tracking-wide">요일별 기록</p>
        <div className="flex gap-2 items-end h-16">
          {stats.dayMap.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-accent rounded-sm transition-all"
                style={{ height: `${count === 0 ? 2 : (count / stats.maxDay) * 48}px`, opacity: count === 0 ? 0.15 : 1 }} />
              <span className="font-sans text-[10px] text-ink-faint">{stats.DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 태그 TOP 5 */}
      {stats.topTags.length > 0 && (
        <div className="bg-white dark:bg-paper-warm border border-paper-border rounded-sm p-5">
          <p className="font-sans text-[11px] text-ink-faint font-light mb-3 tracking-wide">자주 쓴 태그</p>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map(([tag, count]) => (
              <span key={tag} className="font-sans text-[12px] px-3 py-1.5 rounded-sm bg-accent-pale text-accent border border-accent/20">
                #{tag} <span className="text-accent/60 text-[10px]">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
