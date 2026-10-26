import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button, Field, Modal, inputCls } from '@/components/ui'
import { projectHooks } from '@/hooks/data'
import { projectSchema, type ProjectForm as Form } from '@/lib/validation'
import { errMsg, LABELS } from '@/lib/utils'
import type { Project } from '@/types'

export default function ProjectFormModal({ open, onClose, project }: { open: boolean; onClose: () => void; project?: Project }) {
  const save = projectHooks.useSave()
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '', description: project?.description ?? '', status: project?.status ?? 'planning',
      priority: project?.priority ?? 'medium', color: project?.color ?? '#8B5CF6', deadline: project?.deadline ?? '',
    },
  })
  const onSubmit = async (v: Form) => {
    try {
      await save.mutateAsync({ id: project?.id, input: { ...v, description: v.description || null, deadline: v.deadline || null } })
      toast.success(project ? 'Project updated' : 'Project created')
      onClose()
    } catch (e) { toast.error(errMsg(e)) }
  }
  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit project' : 'New project'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name?.message}><input className={inputCls} {...register('name')} autoFocus /></Field>
        <Field label="Description" error={errors.description?.message}><textarea rows={3} className={inputCls} {...register('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status"><select className={inputCls} {...register('status')}>{['planning', 'active', 'on_hold', 'completed'].map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select></Field>
          <Field label="Priority"><select className={inputCls} {...register('priority')}>{['low', 'medium', 'high'].map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}</select></Field>
          <Field label="Deadline"><input type="date" className={inputCls} {...register('deadline')} /></Field>
          <Field label="Color" error={errors.color?.message}><input type="color" className={`${inputCls} h-[38px] p-1`} {...register('color')} /></Field>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" loading={save.isPending}>{project ? 'Save' : 'Create'}</Button></div>
      </form>
    </Modal>
  )
}
