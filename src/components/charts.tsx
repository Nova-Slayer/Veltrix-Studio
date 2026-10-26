import type { ReactNode } from 'react'
import { Card } from '@/components/ui'

export function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card className="flex items-center gap-4"><div className="rounded-xl bg-brand/15 p-3 text-brand2">{icon}</div>
      <div><p className="text-2xl font-semibold">{value}</p><p className="text-sm text-mute">{label}</p></div></Card>
  )
}

export function BarList({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  if (max === 0) return <p className="text-sm text-mute">No data yet.</p>
  return (
    <ul className="space-y-3">{data.map((d) => (
      <li key={d.label}><div className="mb-1 flex justify-between text-sm"><span>{d.label}</span><span className="text-mute">{d.value}</span></div>
        <div className="h-2 rounded-full bg-raised"><div className="h-2 rounded-full bg-brand" style={{ width: `${(d.value / max) * 100}%` }} /></div></li>))}
    </ul>
  )
}

export function Columns({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  if (max === 0) return <p className="text-sm text-mute">No completed tasks in this period.</p>
  return (
    <div className="flex h-40 items-end gap-2" role="img" aria-label="Completed tasks per week">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-xs text-mute">{d.value}</span>
          <div className="w-full rounded-t-md bg-brand" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 0 }} />
          <span className="text-[10px] text-mute">{d.label}</span>
        </div>))}
    </div>
  )
}
