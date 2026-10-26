import { Card, ErrorBox, PageHeader, Skeleton } from '@/components/ui'
import { projectHooks, taskHooks, useActivity } from '@/hooks/data'
import { completedPerWeek, fmtDate, LABELS } from '@/lib/utils'
import { BarList, Columns, StatCard } from '@/components/charts'
import { CheckCircle2, Percent } from 'lucide-react'

export default function AnalyticsPage() {
  const projects = projectHooks.useList()
  const tasks = taskHooks.useList()
  const activity = useActivity(15)
  if (projects.isLoading || tasks.isLoading) return <Skeleton className="h-64" />
  if (projects.isError || tasks.isError) return <ErrorBox />
  const P = projects.data ?? [], T = tasks.data ?? []
  const done = T.filter((t) => t.status === 'done').length
  const rate = T.length ? Math.round((done / T.length) * 100) : 0
  const weekly = completedPerWeek(T, 8).map((value, i) => ({ value, label: i === 7 ? 'This wk' : `-${7 - i}w` }))
  return (
    <>
      <PageHeader title="Analytics" subtitle="Computed from your saved projects and tasks. Nothing here is sample data." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard icon={<Percent className="h-5 w-5" />} label="Task completion rate" value={`${rate}%`} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Tasks completed (all time)" value={done} />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-semibold">Projects by status</h2><BarList data={['planning', 'active', 'on_hold', 'completed'].map((s) => ({ label: LABELS[s], value: P.filter((p) => p.status === s).length }))} /></Card>
        <Card><h2 className="mb-4 font-semibold">Tasks by status</h2><BarList data={['todo', 'in_progress', 'done'].map((s) => ({ label: LABELS[s], value: T.filter((t) => t.status === s).length }))} /></Card>
      </div>
      <Card className="mb-6"><h2 className="mb-4 font-semibold">Completed tasks per week</h2><Columns data={weekly} /></Card>
      <Card><h2 className="mb-3 font-semibold">Recent activity</h2>
        {activity.data?.length ? <ul className="divide-y divide-line">{activity.data.map((a) => <li key={a.id} className="flex justify-between py-2 text-sm"><span className="capitalize">{a.action} {a.entity_type}</span><span className="text-mute">{fmtDate(a.created_at)}</span></li>)}</ul> : <p className="text-sm text-mute">No activity yet.</p>}
      </Card>
    </>
  )
}
