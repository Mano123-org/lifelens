import type { ReactNode } from 'react'
export default function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="card stat">
      <div className="stat-icon">{icon}</div>
      <div><div className="muted">{label}</div><div className="stat-value">{value}</div></div>
    </div>
  )
}
