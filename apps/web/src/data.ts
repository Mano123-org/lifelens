// Shape of the data the dashboard reads. In Phase 2 this comes from the API.
export interface LifeData {
  isDemo: boolean
  usage: { app: string; minutes: number; category: string }[]
  weekly: { day: string; minutes: number }[]
  spending: { category: string; amount: number }[]
  tasks: { title: string; time: string; done: boolean }[]
  income: number
  savings: number
}

export interface ApiSummary {
  isDemo: false
  tasks: { id: number; title: string; dueAt: string | null; completed: number }[]
  usage: { app: string; minutes: number; category: string }[]
  transactions: { kind: 'income' | 'expense'; category: string; amount: number; occurredOn: string; note: string | null }[]
}

const LOCAL_KEY = 'll-local-records'
const emptyLocalSummary = (): ApiSummary => ({ isDemo: false, tasks: [], usage: [], transactions: [] })
const readLocalSummary = (): ApiSummary => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '') as ApiSummary }
  catch { return emptyLocalSummary() }
}
const writeLocalSummary = (summary: ApiSummary) => localStorage.setItem(LOCAL_KEY, JSON.stringify(summary))
const localMode = () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const getSummary = async (): Promise<ApiSummary> => {
  try {
    const response = await fetch('/api/summary')
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error()
    return response.json() as Promise<ApiSummary>
  } catch {
    if (localMode()) return readLocalSummary()
    throw new Error('The LifeLens API is unavailable. Configure D1 and run the Worker for saved data.')
  }
}

export const apiRequest = async (path: string, method: string, body: Record<string, unknown>) => {
  try {
    const response = await fetch(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error()
    const result = await response.json() as { error?: string }
    if (!response.ok) throw new Error(result.error ?? 'Request failed')
    return result
  } catch (error) {
    if (!localMode()) throw error instanceof Error && error.message ? error : new Error('The LifeLens API is unavailable. Configure D1 and run the Worker for saved data.')
    const summary = readLocalSummary()
    if (path === '/api/tasks' && method === 'POST') summary.tasks.push({ id: Date.now(), title: String(body.title), dueAt: null, completed: 0 })
    else if (path === '/api/usage' && method === 'POST') summary.usage.push({ app: String(body.appName), category: String(body.category ?? 'Uncategorized'), minutes: Number(body.minutes) })
    else if (path === '/api/transactions' && method === 'POST') summary.transactions.push({ kind: body.kind as 'income' | 'expense', category: String(body.category), amount: Number(body.amount), occurredOn: String(body.occurredOn), note: null })
    else throw new Error('This local action is not supported without the Worker API.')
    writeLocalSummary(summary)
    return { ok: true }
  }
}

export const summaryToLifeData = (summary: ApiSummary): LifeData => {
  const spending = summary.transactions.filter(t => t.kind === 'expense').reduce<{ category: string; amount: number }[]>((result, transaction) => {
    const current = result.find(item => item.category === transaction.category)
    if (current) current.amount += transaction.amount
    else result.push({ category: transaction.category, amount: transaction.amount })
    return result
  }, [])
  const income = summary.transactions.filter(t => t.kind === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = summary.transactions.filter(t => t.kind === 'expense').reduce((sum, t) => sum + t.amount, 0)
  return {
    isDemo: false,
    usage: summary.usage,
    weekly: [],
    spending,
    tasks: summary.tasks.map(task => ({ title: task.title, time: task.dueAt?.slice(11, 16) ?? 'Any time', done: task.completed === 1 })),
    income,
    savings: income - expenses,
  }
}

// Only used when the user explicitly clicks "Load demo data".
export const demoData = (): LifeData => ({
  isDemo: true,
  usage: [
    { app: 'WhatsApp', minutes: 135, category: 'Social' },
    { app: 'Chrome', minutes: 102, category: 'Productivity' },
    { app: 'YouTube', minutes: 88, category: 'Entertainment' },
    { app: 'Instagram', minutes: 45, category: 'Social' },
    { app: 'Spotify', minutes: 32, category: 'Entertainment' },
  ],
  weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day, minutes: [300, 350, 280, 410, 330, 260, 342][i],
  })),
  spending: [
    { category: 'Food', amount: 3280 }, { category: 'Transport', amount: 1850 },
    { category: 'Shopping', amount: 1540 }, { category: 'Bills', amount: 1240 },
    { category: 'Entertainment', amount: 1030 },
  ],
  tasks: [
    { title: 'Study for exam', time: '09:00', done: true },
    { title: 'Project work', time: '11:00', done: true },
    { title: 'Gym', time: '17:00', done: false },
    { title: 'Read a book', time: '20:00', done: false },
  ],
  income: 15000,
  savings: 25680,
})

export const fmtMinutes = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`
export const fmtMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`
