import { useEffect, useState, type FormEvent } from 'react'
import { apiRequest, type ApiSummary } from '../data'

type Props = { name: string; summary: ApiSummary; onRefresh: () => Promise<void> }

export default function Workspace({ name, summary, onRefresh }: Props) {
  const [title, setTitle] = useState('')
  const [appName, setAppName] = useState('')
  const [minutes, setMinutes] = useState('30')
  const [category, setCategory] = useState('General')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<'income' | 'expense'>('expense')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [network, setNetwork] = useState<{ source: string; events: number; bytesSent: number; bytesReceived: number }[]>([])

  useEffect(() => {
    if (name !== 'Network Monitor') return
    void fetch('/api/network/summary').then(response => response.json()).then(result => setNetwork(result.sources ?? [])).catch(() => setError('Network telemetry is unavailable until the Worker database is configured.'))
  }, [name])

  const save = async (action: () => Promise<unknown>) => {
    setBusy(true); setNotice(''); setError('')
    try { await action(); await onRefresh(); setNotice('Saved to your LifeLens records.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save record') }
    finally { setBusy(false) }
  }

  if (name === 'Routines & Tasks') return <section className="workspace card">
    <h2>Routines & Tasks</h2><p className="muted">Tasks are stored in the connected D1 database.</p>
    <form className="form-row" onSubmit={event => { event.preventDefault(); void save(() => apiRequest('/api/tasks', 'POST', { title })) }}>
      <input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Add a task" required />
      <button className="btn" disabled={busy}>Add task</button>
    </form>
    <div className="list">{summary.tasks.length ? summary.tasks.map(task => <div className="row" key={task.id}><span>{task.completed ? '✓' : '○'} {task.title}</span><button className="text-button" onClick={() => void save(() => apiRequest(`/api/tasks/${task.id}`, 'PATCH', { completed: !task.completed }))}>{task.completed ? 'Reopen' : 'Complete'}</button></div>) : <p className="muted">No tasks recorded yet.</p>}</div>
    {notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}
  </section>

  if (name === 'App Usage') return <section className="workspace card">
    <h2>App Usage</h2><p className="muted">Manual entries are recorded. Device collectors require separate permission and integration.</p>
    <form className="form-grid" onSubmit={event => { event.preventDefault(); void save(() => apiRequest('/api/usage', 'POST', { appName, minutes, category })) }}>
      <input aria-label="Application name" value={appName} onChange={event => setAppName(event.target.value)} placeholder="Application name" required />
      <input aria-label="Minutes" type="number" min="1" value={minutes} onChange={event => setMinutes(event.target.value)} required />
      <input aria-label="Category" value={category} onChange={event => setCategory(event.target.value)} required />
      <button className="btn" disabled={busy}>Record usage</button>
    </form>
    <div className="list">{summary.usage.length ? summary.usage.map(item => <div className="row" key={`${item.app}-${item.category}`}><span>{item.app} <small className="muted">{item.category}</small></span><span>{item.minutes} min</span></div>) : <p className="muted">No usage records yet.</p>}</div>
    {notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}
  </section>

  if (name === 'Network Monitor') return <section className="workspace card">
    <h2>Network Monitor</h2>
    <p className="muted">Authorized telemetry from connected sources only. This site cannot inspect devices without an installed collector and permission.</p>
    <div className="list">{network.length ? network.map(item => <div className="row" key={item.source}><span>{item.source}</span><span>{item.events} events · {item.bytesSent + item.bytesReceived} bytes</span></div>) : <p className="muted">No network events recorded yet.</p>}</div>
    {error && <p className="error">{error}</p>}
  </section>

  if (name === 'Analytics') {
    const totalMinutes = summary.usage.reduce((total, item) => total + item.minutes, 0)
    const expenses = summary.transactions.filter(item => item.kind === 'expense').reduce((total, item) => total + item.amount, 0)
    const income = summary.transactions.filter(item => item.kind === 'income').reduce((total, item) => total + item.amount, 0)
    const completed = summary.tasks.filter(item => item.completed === 1).length
    return <section className="workspace card"><h2>Analytics</h2><p className="muted">Calculated from your stored records.</p><div className="metric-grid"><div><strong>{totalMinutes}</strong><span>screen-time minutes</span></div><div><strong>₹{expenses.toLocaleString('en-IN')}</strong><span>expenses</span></div><div><strong>₹{(income - expenses).toLocaleString('en-IN')}</strong><span>net savings</span></div><div><strong>{completed}/{summary.tasks.length}</strong><span>tasks complete</span></div></div></section>
  }

  if (name === 'Reports') {
    const download = () => {
      const rows = [['type', 'label', 'value'], ...summary.usage.map(item => ['screen-time', item.app, String(item.minutes)]), ...summary.transactions.map(item => [item.kind, item.category, String(item.amount)])]
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' }))
      link.download = 'lifelens-report.csv'; link.click(); URL.revokeObjectURL(link.href)
    }
    return <section className="workspace card"><h2>Reports</h2><p className="muted">Export the currently loaded records as CSV.</p><button className="btn" onClick={download}>Download CSV report</button><div className="list"><p>{summary.usage.length} usage groups</p><p>{summary.transactions.length} transactions</p><p>{summary.tasks.length} tasks</p></div></section>
  }

  if (name === 'AI Assistant') return <Assistant summary={summary} />

  if (name === 'Settings') return <section className="workspace card"><h2>Settings</h2><p className="muted">Privacy controls for this browser session.</p><label className="setting"><input type="checkbox" defaultChecked /> Allow authorized browser monitoring</label><label className="setting"><input type="checkbox" /> Allow device collector integration</label><p className="muted">Device collectors are never enabled without explicit permission.</p></section>

  if (name === 'Finances') return <section className="workspace card">
    <h2>Finances</h2><p className="muted">Manual records only. No bank connection is enabled.</p>
    <form className="form-grid" onSubmit={event => { event.preventDefault(); void save(() => apiRequest('/api/transactions', 'POST', { kind, category, amount, occurredOn: new Date().toISOString().slice(0, 10) })) }}>
      <select aria-label="Transaction type" value={kind} onChange={event => setKind(event.target.value as 'income' | 'expense')}><option value="expense">Expense</option><option value="income">Income</option></select>
      <input aria-label="Category" value={category} onChange={event => setCategory(event.target.value)} required />
      <input aria-label="Amount" type="number" min="1" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount" required />
      <button className="btn" disabled={busy}>Save transaction</button>
    </form>
    <div className="list">{summary.transactions.length ? summary.transactions.map((item, index) => <div className="row" key={`${item.occurredOn}-${index}`}><span>{item.category} <small className="muted">{item.occurredOn}</small></span><span className={item.kind === 'income' ? 'positive' : ''}>{item.kind === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}</span></div>) : <p className="muted">No transactions recorded yet.</p>}</div>
    {notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}
  </section>

  return <div className="card empty"><h2>{name}</h2><p className="muted">This section is not connected yet, so it does not show invented records.</p></div>
}

function Assistant({ summary }: { summary: ApiSummary }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask about your stored LifeLens records.')
  const ask = (event: FormEvent) => {
    event.preventDefault()
    const text = question.toLowerCase()
    if (text.includes('screen') || text.includes('app')) setAnswer(`You recorded ${summary.usage.reduce((total, item) => total + item.minutes, 0)} minutes across ${summary.usage.length} app records.`)
    else if (text.includes('expense') || text.includes('spend')) setAnswer(`Your recorded expenses total ₹${summary.transactions.filter(item => item.kind === 'expense').reduce((total, item) => total + item.amount, 0).toLocaleString('en-IN')}.`)
    else if (text.includes('task')) setAnswer(`${summary.tasks.filter(item => item.completed === 1).length} of ${summary.tasks.length} recorded tasks are complete.`)
    else setAnswer('I can answer questions about recorded screen time, expenses, and tasks. No unrecorded activity is assumed.')
  }
  return <section className="workspace card"><h2>AI Assistant</h2><p className="muted">This working model answers from stored records only. No external AI service is configured.</p><form className="form-row" onSubmit={ask}><input aria-label="Assistant question" value={question} onChange={event => setQuestion(event.target.value)} placeholder="How much screen time did I record?" required /><button className="btn">Ask</button></form><div className="answer">{answer}</div></section>
}
