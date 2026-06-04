import { format } from 'date-fns'

interface HeaderProps {
  dark: boolean
  onToggleDark: () => void
}

export function Header({ dark, onToggleDark }: HeaderProps) {
  const today = format(new Date(), 'yyyy.MM.dd')
  return (
    <header className="py-10 border-b border-paper-border mb-10">
      <div className="flex items-baseline gap-3 mb-1.5">
        <h1 className="font-serif text-[32px] italic text-ink tracking-tight leading-none">Vestori</h1>
        <span className="w-1.5 h-1.5 rounded-full bg-accent mb-1 flex-shrink-0" />
        <div className="ml-auto flex items-center gap-3">
          <span className="font-sans text-xs text-ink-faint font-light tracking-widest">{today}</span>
          <button onClick={onToggleDark} title={dark ? '라이트 모드' : '다크 모드'}
            className="w-7 h-7 rounded-sm border border-paper-border flex items-center justify-center text-ink-faint hover:text-ink hover:border-accent-light transition-all cursor-pointer bg-paper-warm text-[13px]">
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </div>
      <p className="font-sans text-[11px] font-light text-ink-faint tracking-[0.08em]">삶의 흔적이 이야기가 되는 공간</p>
    </header>
  )
}
