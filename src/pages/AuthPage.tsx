import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

export function AuthPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password)
      if (error) setError(error)
    } else {
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        setError(error)
      } else {
        setMessage('가입 확인 이메일을 보냈어요. 메일함을 확인해주세요.')
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-[38px] italic text-ink tracking-tight leading-none mb-2">
            Vestori
          </h1>
          <p className="font-sans text-[11px] font-light text-ink-faint tracking-[0.1em]">
            삶의 흔적이 이야기가 되는 공간
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-paper-border rounded-sm shadow-sm p-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-l-sm" />

          <p className="font-body text-[13px] font-light text-ink-muted mb-6 italic">
            {mode === 'login' ? '다시 돌아오셨군요.' : '처음 오셨나요?'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-sans text-[11px] text-ink-faint font-light tracking-[0.06em] block mb-1.5">
                이메일
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full border border-paper-border rounded-sm px-3 py-2 font-sans text-[13px] text-ink bg-paper-warm outline-none focus:border-accent-light transition-colors placeholder:text-ink-faint"
              />
            </div>

            <div>
              <label className="font-sans text-[11px] text-ink-faint font-light tracking-[0.06em] block mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6자 이상"
                className="w-full border border-paper-border rounded-sm px-3 py-2 font-sans text-[13px] text-ink bg-paper-warm outline-none focus:border-accent-light transition-colors placeholder:text-ink-faint"
              />
            </div>

            {error && (
              <p className="font-sans text-[12px] text-red-500 font-light">{error}</p>
            )}
            {message && (
              <p className="font-sans text-[12px] text-accent font-light">{message}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-ink text-white rounded-sm py-2.5 font-sans text-[13px] tracking-[0.04em] transition-all hover:bg-accent disabled:opacity-40 disabled:cursor-default active:scale-[0.98]"
            >
              {submitting ? '...' : mode === 'login' ? '로그인' : '가입하기'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center font-sans text-[12px] font-light text-ink-faint mt-5">
          {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null) }}
            className="text-accent underline-offset-2 underline cursor-pointer bg-none border-none font-sans text-[12px]"
          >
            {mode === 'login' ? '가입하기' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  )
}
