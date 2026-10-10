const PHASES: Record<string, string> = {
  'App Usage': 'Phase 6 (usage tracking), with manual entry and CSV import first',
  'Routines & Tasks': 'Phase 3 (routines and tasks)',
  Finances: 'Phase 3 (transactions, budgets, CSV import and export)',
  Analytics: 'Phase 4 (analytics)',
  'AI Assistant': 'Phase 5 (AI assistant)',
  Reports: 'Phase 4 (reports and summaries)',
  Settings: 'Phase 2 (accounts) and Phase 6 (privacy controls)',
}
export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="card empty">
      <h2>{name}</h2>
      <p className="muted">This screen is built in {PHASES[name] ?? 'a later phase'}. It needs the backend and database first, so it stays empty rather than showing made-up data.</p>
    </div>
  )
}
