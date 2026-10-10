import { useState } from 'react'
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
