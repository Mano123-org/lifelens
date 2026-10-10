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
