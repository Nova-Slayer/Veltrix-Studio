import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, Confirm, priorityTone } from '@/components/ui'
import { taskHooks } from '@/hooks/data'
import { errMsg, fmtDate, isOverdue, LABELS } from '@/lib/utils'
import type { Task } from '@/types'
import TaskFormModal from './TaskForm'

export default function TaskRow({ task, projectName }: { task: Task; projectName?: string }) {
  const save = taskHooks.useSave()
  const remove = taskHooks.useRemove()
  const [edit, setEdit] = useState(false)
  const [del, setDel] = useState(false)
  const done = task.status === 'done'
  const toggle = () => save.mutate({ id: task.id, input: { status: done ? 'todo' : 'done' } }, { onError: (e) => toast.error(errMsg(e)) })
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
      <input type="checkbox" checked={done} onChange={toggle} aria-label={`Mark "${task.title}" ${done ? 'not done' : 'done'}`} className="h-4 w-4 accent-brand" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${done ? 'text-mute line-through' : ''}`}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-mute">
          {projectName && <span>{projectName}</span>}
          {task.due_date && <span className={isOverdue(task) ? 'text-bad' : ''}>{isOverdue(task) ? 'Overdue · ' : 'Due '}{fmtDate(task.due_date)}</span>}
        </div>
      </div>
      <Badge tone={priorityTone(task.priority)}>{LABELS[task.priority]}</Badge>
      <button onClick={() => setEdit(true)} aria-label="Edit task" className="p-1 text-mute hover:text-ink"><Pencil className="h-4 w-4" /></button>
      <button onClick={() => setDel(true)} aria-label="Delete task" className="p-1 text-mute hover:text-bad"><Trash2 className="h-4 w-4" /></button>
      {edit && <TaskFormModal open onClose={() => setEdit(false)} task={task} />}
      <Confirm open={del} onClose={() => setDel(false)} title="Delete task?" message={`"${task.title}" will be permanently deleted.`} loading={remove.isPending}
        onConfirm={() => remove.mutate(task.id, { onSuccess: () => { toast.success('Task deleted'); setDel(false) }, onError: (e) => toast.error(errMsg(e)) })} />
    </div>
  )
}
