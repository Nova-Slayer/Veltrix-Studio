import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button, Field, Modal, inputCls } from '@/components/ui'
import { resourceHooks } from '@/hooks/data'
import { parseTags, resourceSchema, type ResourceForm as Form } from '@/lib/validation'
import { errMsg, LABELS } from '@/lib/utils'
import type { Resource, ResourceCategory } from '@/types'

const cats: ResourceCategory[] = ['link', 'documentation', 'tutorial', 'tool', 'design', 'note']

export default function ResourceFormModal({ open, onClose, resource }: { open: boolean; onClose: () => void; resource?: Resource }) {
  const save = resourceHooks.useSave()
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { title: resource?.title ?? '', url: resource?.url ?? '', description: resource?.description ?? '', category: resource?.category ?? 'link', tags: resource?.tags.join(', ') ?? '' },
  })
  const onSubmit = async (v: Form) => {
    try {
      await save.mutateAsync({ id: resource?.id, input: { title: v.title, url: v.url || null, description: v.description || null, category: v.category, tags: parseTags(v.tags) } })
      toast.success(resource ? 'Resource updated' : 'Resource added')
      onClose()
    } catch (e) { toast.error(errMsg(e)) }
  }
  return (
    <Modal open={open} onClose={onClose} title={resource ? 'Edit resource' : 'New resource'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Title" error={errors.title?.message}><input className={inputCls} {...register('title')} autoFocus /></Field>
        <Field label="URL (optional)" error={errors.url?.message}><input className={inputCls} placeholder="https://" {...register('url')} /></Field>
        <Field label="Description" error={errors.description?.message}><textarea rows={3} className={inputCls} {...register('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category"><select className={inputCls} {...register('category')}>{cats.map((c) => <option key={c} value={c}>{LABELS[c]}</option>)}</select></Field>
          <Field label="Tags (comma separated)" error={errors.tags?.message}><input className={inputCls} {...register('tags')} /></Field>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" loading={save.isPending}>{resource ? 'Save' : 'Add'}</Button></div>
      </form>
    </Modal>
  )
}
