import { Clock, AppWindow, Receipt, Banknote, PiggyBank, CheckCircle2, Lightbulb } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import StatCard from '../components/StatCard'
import { fmtMinutes, fmtMoney, type LifeData } from '../data'

const COLORS = ['#6d7cff', '#2dd4bf', '#a78bfa', '#38bdf8', '#f472b6']

export default function Dashboard({ data, onLoadDemo }: { data: LifeData | null; onLoadDemo: () => void }) {
  if (!data) {
    return (
      <div className="card empty">
        <h2>No activity recorded yet</h2>
        <p className="muted">Add usage, tasks and transactions to see them here. You can also explore the dashboard with sample data.</p>
        <button className="btn" onClick={onLoadDemo}>Load demo data</button>
      </div>
    )
  }
  const totalMin = data.usage.reduce((s, u) => s + u.minutes, 0)
  const spent = data.spending.reduce((s, x) => s + x.amount, 0)
  const done = data.tasks.filter(t => t.done).length
  const top = [...data.spending].sort((a, b) => b.amount - a.amount)[0]

  return (
    <>
      {data.isDemo && <div className="banner">Demo data: these numbers are samples, not your activity.</div>}
      <div className="grid stats">
        <StatCard label="Screen time" value={fmtMinutes(totalMin)} icon={<Clock />} />
        <StatCard label="Apps used" value={String(data.usage.length)} icon={<AppWindow />} />
        <StatCard label="Total spent" value={fmtMoney(spent)} icon={<Receipt />} />
        <StatCard label="Monthly income" value={fmtMoney(data.income)} icon={<Banknote />} />
        <StatCard label="Savings" value={fmtMoney(data.savings)} icon={<PiggyBank />} />
        <StatCard label="Tasks completed" value={`${done}/${data.tasks.length}`} icon={<CheckCircle2 />} />
      </div>
      <div className="grid two">
        <section className="card">
          <h3>Screen time this week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weekly}>
              <XAxis dataKey="day" stroke="var(--muted)" /><YAxis stroke="var(--muted)" />
              <Tooltip formatter={(v: number) => fmtMinutes(v)} contentStyle={{ background: 'var(--card)', border: 'none' }} />
              <Bar dataKey="minutes" fill="#6d7cff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="card">
          <h3>Spending by category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.spending} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={85}>
                {data.spending.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ background: 'var(--card)', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
      <div className="grid three">
        <section className="card"><h3>Top apps</h3>
          {data.usage.map(u => <div className="row" key={u.app}><span>{u.app}</span><span className="muted">{fmtMinutes(u.minutes)}</span></div>)}
        </section>
        <section className="card"><h3>Today's tasks</h3>
          {data.tasks.map(t => <div className="row" key={t.title}><span>{t.done ? '✓' : '○'} {t.title}</span><span className="muted">{t.time}</span></div>)}
        </section>
        <section className="card"><h3><Lightbulb size={16} /> Insights</h3>
          <p>{fmtMoney(top.amount)} of your {fmtMoney(spent)} spending went to {top.category} ({Math.round((top.amount / spent) * 100)}%).</p>
          <p className="muted">Calculated from recorded transactions.</p>
        </section>
      </div>
    </>
  )
}
