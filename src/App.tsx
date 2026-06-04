import { Header } from './components/Header'
import { Composer } from './components/Composer'
import { Feed } from './components/Feed'
import { useEntries } from './hooks/useEntries'

export function App() {
  const { entries, addEntry, toggleLike, deleteEntry } = useEntries()

  return (
    <div className="min-h-screen bg-paper relative">
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[680px] mx-auto px-6 pb-20">
        <Header />
        <Composer onSubmit={addEntry} />
        <Feed entries={entries} onLike={toggleLike} onDelete={deleteEntry} />
      </div>
    </div>
  )
}
