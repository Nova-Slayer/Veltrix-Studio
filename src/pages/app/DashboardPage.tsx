import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, FolderKanban, ListTodo, Plus } from 'lucide-react'
import { Badge, Button, Card, Empty, ErrorBox, PageHeader, Skeleton, statusTone } from '@/components/ui'
import { projectHooks, taskHooks, useActivity, useProfile } from '@/hooks/data'
import { useAuth } from '@/features/auth/AuthContext'
import { fmtDate, isOverdue, LABELS, todayStr } from '@/lib/utils'
import { BarList, StatCard } from '@/components/charts'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const projects = projectHooks.useList()
  const tasks = taskHooks.useList()
  const activity = useActivity(8)
  const name = profile?.display_name || user?.email?.split('@')[0] || 'there'

  if (projects.isLoading || tasks.isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
  if (projects.isError || tasks.isError) return <ErrorBox />

  const P = projects.data ?? [], T = tasks.data ?? []
  const done = T.filter((t) => t.status === 'done').length
  const upcoming = [...T.filter((t) => t.due_date && t.status !== 'done')].sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string)).slice(0, 5)
  const statusData = ['planning', 'active', 'on_hold', 'completed'].map((s) => ({ label: LABELS[s], value: P.filter((p) => p.status === s).length }))
  const taskData = ['todo', 'in_progress', 'done'].map((s) => ({ label: LABELS[s], value: T.filter((t) => t.status === s).length }))

  return (
    <>
      <PageHeader title={`Welcome back, ${name}`} subtitle={`Today is ${fmtDate(todayStr())}.`}
        action={<div className="flex flex-wrap gap-2">
          <Link to="/app/projects?new=1"><Button><Plus className="h-4 w-4" />Project</Button></Link>
          <Link to="/app/tasks?new=1"><Button variant="outline"><Plus className="h-4 w-4" />Task</Button></Link>
          <Link to="/app/resources?new=1"><Button variant="outline"><Plus className="h-4 w-4" />Resource</Button></Link></div>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FolderKanban className="h-5 w-5" />} label="Total projects" value={P.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed tasks" value={done} />
        <StatCard icon={<ListTodo className="h-5 w-5" />} label="Pending tasks" value={T.length - done} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Overdue" value={T.filter(isOverdue).length} />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-semibold">Projects by status</h2><BarList data={statusData} /></Card>
        <Card><h2 className="mb-4 font-semibold">Task completion</h2><BarList data={taskData} /></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card><h2 className="mb-3 font-semibold">Recent projects</h2>
          {P.length === 0 ? <p className="text-sm text-mute">No projects yet.</p> : P.slice(0, 5).map((p) => (
            <Link key={p.id} to={`/app/projects/${p.id}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-raised"><span className="flex items-center gap-2 truncate"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.name}</span><Badge tone={statusTone(p.status)}>{LABELS[p.status]}</Badge></Link>))}
        </Card>
        <Card><h2 className="mb-3 font-semibold">Upcoming deadlines</h2>
          {upcoming.length === 0 ? <p className="text-sm text-mute">No tasks with due dates.</p> : upcoming.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-2 py-2 text-sm"><span className="truncate">{t.title}</span><span className={isOverdue(t) ? 'text-bad' : 'text-mute'}>{fmtDate(t.due_date)}</span></div>))}
        </Card>
        <Card><h2 className="mb-3 font-semibold">Recent activity</h2>
          {activity.data?.length ? activity.data.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-2 py-2 text-sm"><span className="capitalize">{a.action} {a.entity_type}</span><span className="text-xs text-mute">{fmtDate(a.created_at)}</span></div>))
            : <Empty icon={<Clock />} title="Nothing yet" text="Activity appears as you work." />}
        </Card>
      </div>
    </>
  )
}
