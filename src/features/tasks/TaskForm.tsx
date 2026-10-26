import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button, Field, Modal, inputCls } from '@/components/ui'
import { projectHooks, taskHooks } from '@/hooks/data'
import { taskSchema, type TaskForm as Form } from '@/lib/validation'
import { errMsg, LABELS } from '@/lib/utils'
import type { Task } from '@/types'

export default function TaskFormModal({ open, onClose, task, projectId }: { open: boolean; onClose: () => void; task?: Task; projectId?: string }) {
  const save = taskHooks.useSave()
  const { data: projects } = projectHooks.useList()
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '', description: task?.description ?? '', status: task?.status ?? 'todo',
      priority: task?.priority ?? 'medium', due_date: task?.due_date ?? '', project_id: task?.project_id ?? projectId ?? '',
    },
  })
  const onSubmit = async (v: Form) => {
    try {
      await save.mutateAsync({ id: task?.id, input: { ...v, description: v.description || null, due_date: v.due_date || null, project_id: v.project_id || null } })
      toast.success(task ? 'Task updated' : 'Task created')
      onClose()
    } catch (e) { toast.error(errMsg(e)) }
  }
  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Title" error={errors.title?.message}><input className={inputCls} {...register('title')} autoFocus /></Field>
        <Field label="Description" error={errors.description?.message}><textarea rows={3} className={inputCls} {...register('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status"><select className={inputCls} {...register('status')}>{['todo', 'in_progress', 'done'].map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select></Field>
          <Field label="Priority"><select className={inputCls} {...register('priority')}>{['low', 'medium', 'high'].map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select></Field>
          <Field label="Due date"><input type="date" className={inputCls} {...register('due_date')} /></Field>
          <Field label="Project"><select className={inputCls} {...register('project_id')}><option value="">No project</option>{(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" loading={save.isPending}>{task ? 'Save' : 'Create'}</Button></div>
      </form>
    </Modal>
  )
}
