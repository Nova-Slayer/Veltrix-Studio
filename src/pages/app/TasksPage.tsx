import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckSquare, Columns3, List, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, Button, Empty, ErrorBox, ListSkeleton, PageHeader, inputCls, priorityTone } from '@/components/ui'
import { projectHooks, taskHooks } from '@/hooks/data'
import { errMsg, fmtDate, isOverdue, LABELS } from '@/lib/utils'
import TaskFormModal from '@/features/tasks/TaskForm'
import TaskRow from '@/features/tasks/TaskRow'
import type { Task, TaskStatus } from '@/types'

const prio = { high: 0, medium: 1, low: 2 } as const
const cols: TaskStatus[] = ['todo', 'in_progress', 'done']

export default function TasksPage() {
  const [sp] = useSearchParams()
  const [open, setOpen] = useState(sp.get('new') === '1')
  const [view, setView] = useState<'list' | 'board'>('list')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [project, setProject] = useState('all')
  const [sort, setSort] = useState('due')
  const { data, isLoading, isError } = taskHooks.useList()
  const { data: projects } = projectHooks.useList()
  const save = taskHooks.useSave()
  const pname = (id: string | null) => projects?.find((p) => p.id === id)?.name

  const rows = useMemo(() => (data ?? [])
    .filter((t) => (status === 'all' || t.status === status) && (priority === 'all' || t.priority === priority) &&
      (project === 'all' || (project === 'none' ? !t.project_id : t.project_id === project)) && `${t.title} ${t.description ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'priority' ? prio[a.priority] - prio[b.priority] : sort === 'created' ? b.created_at.localeCompare(a.created_at) : (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')),
  [data, q, status, priority, project, sort])

  const move = (t: Task, s: TaskStatus) => save.mutate({ id: t.id, input: { status: s } }, { onError: (e) => toast.error(errMsg(e)) })

  return (
    <>
      <PageHeader title="Tasks" subtitle="Track what needs to get done." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New task</Button>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <input aria-label="Search tasks" placeholder="Search…" className={`${inputCls} col-span-2`} value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All status</option>{cols.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select>
        <select aria-label="Priority" className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)}><option value="all">All priority</option>{['high', 'medium', 'low'].map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select>
        <select aria-label="Project" className={inputCls} value={project} onChange={(e) => setProject(e.target.value)}><option value="all">All projects</option><option value="none">No project</option>{(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select aria-label="Sort" className={inputCls} value={sort} onChange={(e) => setSort(e.target.value)}><option value="due">Due date</option><option value="priority">Priority</option><option value="created">Newest</option></select>
      </div>
      <div className="mb-4 flex gap-2">
        <Button variant={view === 'list' ? 'primary' : 'outline'} onClick={() => setView('list')}><List className="h-4 w-4" />List</Button>
        <Button variant={view === 'board' ? 'primary' : 'outline'} onClick={() => setView('board')}><Columns3 className="h-4 w-4" />Board</Button>
      </div>
      {isLoading ? <ListSkeleton /> : isError ? <ErrorBox /> : rows.length === 0 ? (
        <Empty icon={<CheckSquare className="h-8 w-8" />} title={(data ?? []).length ? 'No matching tasks' : 'No tasks yet'} text={(data ?? []).length ? 'Adjust your filters.' : 'Add a task to get started.'} action={!(data ?? []).length && <Button onClick={() => setOpen(true)}>Create task</Button>} />
      ) : view === 'list' ? (
        <div className="space-y-2">{rows.map((t) => <TaskRow key={t.id} task={t} projectName={pname(t.project_id)} />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {cols.map((c) => (
            <section key={c} aria-label={LABELS[c]} className="rounded-2xl border border-line bg-side p-3">
              <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">{LABELS[c]}<span className="text-mute">{rows.filter((t) => t.status === c).length}</span></h3>
              <div className="space-y-2">
                {rows.filter((t) => t.status === c).map((t) => (
                  <div key={t.id} className="rounded-xl border border-line bg-card p-3">
                    <p className="text-sm font-medium">{t.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><Badge tone={priorityTone(t.priority)}>{LABELS[t.priority]}</Badge>
                      {t.due_date && <span className={isOverdue(t) ? 'text-bad' : 'text-mute'}>{fmtDate(t.due_date)}</span>}</div>
                    <select aria-label={`Move ${t.title}`} className={`${inputCls} mt-2 py-1 text-xs`} value={t.status} onChange={(e) => move(t, e.target.value as TaskStatus)}>{cols.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select>
                  </div>))}
              </div>
            </section>))}
        </div>
      )}
      {open && <TaskFormModal open onClose={() => setOpen(false)} />}
    </>
  )
}
