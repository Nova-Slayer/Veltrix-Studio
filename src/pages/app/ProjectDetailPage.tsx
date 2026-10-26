import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, Button, Card, Confirm, Empty, ErrorBox, ListSkeleton, PageHeader, ProgressBar, inputCls, priorityTone, statusTone } from '@/components/ui'
import { projectHooks, taskHooks } from '@/hooks/data'
import { errMsg, fmtDate, LABELS, progress } from '@/lib/utils'
import ProjectFormModal from '@/features/projects/ProjectForm'
import TaskFormModal from '@/features/tasks/TaskForm'
import TaskRow from '@/features/tasks/TaskRow'

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const nav = useNavigate()
  const { data: projects, isLoading, isError } = projectHooks.useList()
  const { data: tasks } = taskHooks.useList()
  const save = projectHooks.useSave()
  const remove = projectHooks.useRemove()
  const [edit, setEdit] = useState(false)
  const [del, setDel] = useState(false)
  const [newTask, setNewTask] = useState(false)
  const project = projects?.find((p) => p.id === projectId)
  const [notes, setNotes] = useState('')
  useEffect(() => setNotes(project?.notes ?? ''), [project?.notes])

  if (isLoading) return <ListSkeleton />
  if (isError) return <ErrorBox />
  if (!project) return <Empty icon={<ArrowLeft />} title="Project not found" text="It may have been deleted." action={<Link to="/app/projects"><Button>Back to projects</Button></Link>} />

  const pt = (tasks ?? []).filter((t) => t.project_id === project.id)
  const pr = progress(pt)
  return (
    <>
      <Link to="/app/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-mute hover:text-ink"><ArrowLeft className="h-4 w-4" />Projects</Link>
      <PageHeader title={project.name} subtitle={project.description ?? undefined}
        action={<div className="flex gap-2"><Button variant="outline" onClick={() => setEdit(true)}><Pencil className="h-4 w-4" />Edit</Button><Button variant="danger" onClick={() => setDel(true)}><Trash2 className="h-4 w-4" />Delete</Button></div>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Tasks</h2><Button onClick={() => setNewTask(true)}><Plus className="h-4 w-4" />Add task</Button></div>
            {pt.length === 0 ? <Empty icon={<Plus />} title="No tasks yet" text="Add tasks to track progress on this project." /> : <div className="space-y-2">{pt.map((t) => <TaskRow key={t.id} task={t} />)}</div>}
          </div>
          <Card>
            <h2 className="mb-3 font-semibold">Notes</h2>
            <textarea rows={6} maxLength={20000} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Plain-text notes for this project…" />
            <div className="mt-3 flex justify-end"><Button disabled={notes === (project.notes ?? '')} loading={save.isPending}
              onClick={() => save.mutate({ id: project.id, input: { notes: notes || null } }, { onSuccess: () => toast.success('Notes saved'), onError: (e) => toast.error(errMsg(e)) })}>Save notes</Button></div>
          </Card>
        </div>
        <Card className="h-fit space-y-4">
          <div><p className="mb-1 text-xs text-mute">Progress (done tasks ÷ all tasks)</p><p className="mb-2 text-2xl font-semibold">{pr}%</p><ProgressBar value={pr} color={project.color} /></div>
          <div className="flex flex-wrap gap-2"><Badge tone={statusTone(project.status)}>{LABELS[project.status]}</Badge><Badge tone={priorityTone(project.priority)}>{LABELS[project.priority]} priority</Badge></div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-mute">Deadline</dt><dd>{fmtDate(project.deadline)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Created</dt><dd>{fmtDate(project.created_at)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">Updated</dt><dd>{fmtDate(project.updated_at)}</dd></div>
          </dl>
        </Card>
      </div>
      {edit && <ProjectFormModal open onClose={() => setEdit(false)} project={project} />}
      {newTask && <TaskFormModal open onClose={() => setNewTask(false)} projectId={project.id} />}
      <Confirm open={del} onClose={() => setDel(false)} title="Delete project?" message="This also deletes all tasks in this project. This cannot be undone." loading={remove.isPending}
        onConfirm={() => remove.mutate(project.id, { onSuccess: () => { toast.success('Project deleted'); nav('/app/projects') }, onError: (e) => toast.error(errMsg(e)) })} />
    </>
  )
}
