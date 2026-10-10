import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Placeholder from './pages/Placeholder'
import { demoData, type LifeData } from './data'

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('ll-theme') ?? 'dark')
  const [data, setData] = useState<LifeData | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ll-theme', theme)
  }, [theme])

  return (
    <div className="layout">
      <Sidebar page={page} onSelect={setPage} />
      <main>
        <header>
          <div><h1>{page}</h1><p className="muted">LifeLens — Your Life. In Sight.</p></div>
          <div className="actions">
            {data && <button className="btn ghost" onClick={() => setData(null)}>Clear data</button>}
            <button className="btn ghost" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        {page === 'Dashboard' ? <Dashboard data={data} onLoadDemo={() => setData(demoData())} /> : <Placeholder name={page} />}
      </main>
    </div>
  )
}
