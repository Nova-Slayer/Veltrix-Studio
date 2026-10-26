import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FolderKanban, Plus } from 'lucide-react'
import { Badge, Button, Empty, ErrorBox, ListSkeleton, PageHeader, ProgressBar, inputCls, priorityTone, statusTone } from '@/components/ui'
import { projectHooks, taskHooks } from '@/hooks/data'
import { fmtDate, LABELS, progress } from '@/lib/utils'
import ProjectFormModal from '@/features/projects/ProjectForm'

const prio = { high: 0, medium: 1, low: 2 } as const

export default function ProjectsPage() {
  const [sp, setSp] = useSearchParams()
  const [open, setOpen] = useState(sp.get('new') === '1')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('date')
  const q = sp.get('q') ?? ''
  const { data, isLoading, isError } = projectHooks.useList()
  const { data: tasks } = taskHooks.useList()

  const rows = useMemo(() => {
    const list = (data ?? []).filter((p) => (status === 'all' || p.status === status) && (`${p.name} ${p.description ?? ''}`.toLowerCase().includes(q.toLowerCase())))
    return list.sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) : sort === 'status' ? a.status.localeCompare(b.status) :
      sort === 'priority' ? prio[a.priority] - prio[b.priority] : b.created_at.localeCompare(a.created_at))
  }, [data, q, status, sort])

  return (
    <>
      <PageHeader title="Projects" subtitle="Everything you're building, in one place." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New project</Button>} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input aria-label="Search projects" placeholder="Search projects…" className={inputCls} value={q} onChange={(e) => setSp(e.target.value ? { q: e.target.value } : {})} />
        <select aria-label="Filter by status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>{['planning', 'active', 'on_hold', 'completed'].map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
        </select>
        <select aria-label="Sort" className={inputCls} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Newest</option><option value="name">Name</option><option value="status">Status</option><option value="priority">Priority</option>
        </select>
      </div>
      {isLoading ? <ListSkeleton /> : isError ? <ErrorBox /> : rows.length === 0 ? (
        <Empty icon={<FolderKanban className="h-8 w-8" />} title={(data ?? []).length ? 'No matching projects' : 'No projects yet'} text={(data ?? []).length ? 'Try a different search or filter.' : 'Create your first project to start organizing tasks and notes.'}
          action={!(data ?? []).length && <Button onClick={() => setOpen(true)}>Create project</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => {
            const pt = (tasks ?? []).filter((t) => t.project_id === p.id)
            const pr = progress(pt)
            return (
              <Link key={p.id} to={`/app/projects/${p.id}`} className="block rounded-2xl border border-line bg-card p-5 transition-colors hover:border-brand/60">
                <div className="mb-3 flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: p.color }} aria-hidden /><h3 className="truncate font-semibold">{p.name}</h3></div>
                <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm text-mute">{p.description || 'No description'}</p>
                <div className="mb-3 flex flex-wrap gap-2"><Badge tone={statusTone(p.status)}>{LABELS[p.status]}</Badge><Badge tone={priorityTone(p.priority)}>{LABELS[p.priority]}</Badge></div>
                <ProgressBar value={pr} color={p.color} />
                <div className="mt-2 flex justify-between text-xs text-mute"><span>{pr}% · {pt.length} task{pt.length === 1 ? '' : 's'}</span><span>{p.deadline ? `Due ${fmtDate(p.deadline)}` : 'No deadline'}</span></div>
              </Link>
            )
          })}
        </div>
      )}
      {open && <ProjectFormModal open onClose={() => setOpen(false)} />}
    </>
  )
}
