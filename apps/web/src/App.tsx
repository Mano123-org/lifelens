import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { demoData, getSummary, summaryToLifeData, type ApiSummary, type LifeData } from './data'
import Workspace from './pages/Workspace'

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('ll-theme') ?? 'light')
  const [userName, setUserName] = useState(() => localStorage.getItem('ll-user-name') ?? '')
  const [data, setData] = useState<LifeData | null>(null)
  const [summary, setSummary] = useState<ApiSummary | null>(null)
  const [error, setError] = useState('')

  const refresh = async () => {
    try {
      const next = await getSummary()
      setSummary(next)
      setData(next.usage.length || next.tasks.length || next.transactions.length ? summaryToLifeData(next) : null)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load LifeLens data')
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ll-theme', theme)
  }, [theme])

  useEffect(() => { void refresh() }, [])

  return (
    <div className="layout">
      <Sidebar page={page} onSelect={setPage} />
      <main>
        <header>
          <div><h1>{page}</h1><p className="muted">{userName ? `Welcome, ${userName}` : 'LifeLens — Your Life. In Sight.'}</p></div>
          <div className="actions">
            {data && <button className="btn ghost" onClick={() => setData(null)}>Clear data</button>}
            <button className="btn ghost" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        {error && <div className="banner error">{error}</div>}
        {page === 'Dashboard' ? <Dashboard data={data} summary={summary} userName={userName} onUserNameChange={name => { setUserName(name); localStorage.setItem('ll-user-name', name) }} onRefresh={refresh} onLoadDemo={() => setData(demoData())} /> : summary ? <Workspace name={page} summary={summary} onRefresh={refresh} /> : <div className="card empty"><p className="muted">Loading your records...</p></div>}
      </main>
    </div>
  )
}
