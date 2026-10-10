import { LayoutDashboard, Smartphone, ListChecks, Wallet, BarChart3, Bot, FileText, Settings, Aperture } from 'lucide-react'

export const NAV = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'App Usage', icon: Smartphone },
  { name: 'Routines & Tasks', icon: ListChecks },
  { name: 'Finances', icon: Wallet },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'AI Assistant', icon: Bot },
  { name: 'Reports', icon: FileText },
  { name: 'Settings', icon: Settings },
]

export default function Sidebar({ page, onSelect }: { page: string; onSelect: (p: string) => void }) {
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="brand"><Aperture size={26} /><span>LifeLens</span></div>
      {NAV.map(({ name, icon: Icon }) => (
        <button key={name} className={name === page ? 'nav active' : 'nav'} onClick={() => onSelect(name)}>
          <Icon size={18} /><span>{name}</span>
        </button>
      ))}
      <p className="tagline">Track. Analyze. Improve.</p>
    </nav>
  )
}
