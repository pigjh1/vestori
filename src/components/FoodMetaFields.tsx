import type { FoodMeta } from '@/types'

interface Props {
  value: Partial<FoodMeta>
  onChange: (v: Partial<FoodMeta>) => void
}

function formatRating(r: number): string {
  return r % 1 === 0 ? `${r}.0` : `${r}`
}

export function FoodMetaFields({ value, onChange }: Props) {
  const rating = value.rating ?? 0
  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-paper-border/60">
      <p className="text-xs text-ink tracking-wide">음식 정보</p>
      {/* 금액 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-faint w-14 flex-shrink-0">금액</span>
        <div className="relative flex-1">
          <input type="number" min={0} step={100} placeholder="0"
            value={value.amount ?? ''}
            onChange={e => onChange({ ...value, amount: e.target.value ? Number(e.target.value) : null })}
            className="w-full text-ink bg-paper-warm border border-paper-border rounded-sm px-3 py-1.5 pr-7 outline-none focus:border-ink/30 transition-colors" />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint pointer-events-none">원</span>
        </div>
      </div>
      {/* 만족도 슬라이더 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-faint w-14 flex-shrink-0">만족도</span>
        <div className="flex-1 flex items-center gap-2">
          <input type="range" min={0} max={5} step={0.5} value={rating}
            onChange={e => onChange({ ...value, rating: Number(e.target.value) === 0 ? null : Number(e.target.value) })}
            className="flex-1 cursor-pointer" style={{ accentColor: 'var(--color-accent)' }} />
          <span className="text-sm text-ink w-8 text-right flex-shrink-0">
            {rating > 0 ? formatRating(rating) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
