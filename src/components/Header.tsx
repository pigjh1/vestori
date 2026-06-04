import { format } from 'date-fns'

export function Header() {
  const today = format(new Date(), 'yyyy.MM.dd')

  return (
    <header className="py-10 border-b border-paper-border mb-10">
      <div className="flex items-baseline gap-3 mb-1.5">
        <h1 className="font-serif text-[32px] italic text-ink tracking-tight leading-none">
          Vestori
        </h1>
        <span className="w-1.5 h-1.5 rounded-full bg-accent mb-1 flex-shrink-0" />
        <span className="font-sans text-xs text-ink-faint font-light tracking-widest ml-auto">
          {today}
        </span>
      </div>
      <p className="font-sans text-[11px] font-light text-ink-faint tracking-[0.08em]">
        삶의 흔적이 이야기가 되는 공간
      </p>
    </header>
  )
}
