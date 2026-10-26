import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookMarked, ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge, Button, Confirm, Empty, ErrorBox, ListSkeleton, PageHeader, inputCls } from '@/components/ui'
import { resourceHooks } from '@/hooks/data'
import { errMsg, LABELS } from '@/lib/utils'
import ResourceFormModal from '@/features/resources/ResourceForm'
import type { Resource } from '@/types'

const cats = ['link', 'documentation', 'tutorial', 'tool', 'design', 'note']

export default function ResourcesPage() {
  const [sp] = useSearchParams()
  const [open, setOpen] = useState(sp.get('new') === '1')
  const [edit, setEdit] = useState<Resource | undefined>()
  const [del, setDel] = useState<Resource | undefined>()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [favOnly, setFavOnly] = useState(false)
  const { data, isLoading, isError } = resourceHooks.useList()
  const save = resourceHooks.useSave()
  const remove = resourceHooks.useRemove()

  const rows = useMemo(() => (data ?? []).filter((r) =>
    (cat === 'all' || r.category === cat) && (!favOnly || r.is_favorite) &&
    `${r.title} ${r.description ?? ''} ${r.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())
  ).sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite)), [data, q, cat, favOnly])

  return (
    <>
      <PageHeader title="Resource vault" subtitle="Links, docs, tools and notes you want to keep." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add resource</Button>} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input aria-label="Search resources" placeholder="Search title, description, tags…" className={`${inputCls} sm:col-span-2`} value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Category" className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{cats.map((c) => <option key={c} value={c}>{LABELS[c]}</option>)}</select>
        <Button variant={favOnly ? 'primary' : 'outline'} onClick={() => setFavOnly(!favOnly)}><Star className="h-4 w-4" />Favorites</Button>
      </div>
      {isLoading ? <ListSkeleton /> : isError ? <ErrorBox /> : rows.length === 0 ? (
        <Empty icon={<BookMarked className="h-8 w-8" />} title={(data ?? []).length ? 'No matching resources' : 'Your vault is empty'} text={(data ?? []).length ? 'Adjust your search or filters.' : 'Save your first link, doc or note.'} action={!(data ?? []).length && <Button onClick={() => setOpen(true)}>Add resource</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <article key={r.id} className="flex flex-col rounded-2xl border border-line bg-card p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold break-words">{r.title}</h3>
                <button aria-label={r.is_favorite ? 'Remove favorite' : 'Add favorite'} aria-pressed={r.is_favorite} onClick={() => save.mutate({ id: r.id, input: { is_favorite: !r.is_favorite } }, { onError: (e) => toast.error(errMsg(e)) })}>
                  <Star className={`h-5 w-5 ${r.is_favorite ? 'fill-warn text-warn' : 'text-mute'}`} />
                </button>
              </div>
              {r.description && <p className="mb-3 line-clamp-3 text-sm text-mute">{r.description}</p>}
              {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="mb-3 inline-flex items-center gap-1 break-all text-sm text-brand2 hover:underline"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{(() => { try { return new URL(r.url).hostname } catch { return 'Invalid link' } })()}</a>}
              <div className="mt-auto flex flex-wrap items-center gap-1.5"><Badge tone="brand">{LABELS[r.category]}</Badge>{r.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => setEdit(r)} aria-label="Edit resource" className="p-1 text-mute hover:text-ink"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setDel(r)} aria-label="Delete resource" className="p-1 text-mute hover:text-bad"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>))}
        </div>
      )}
      {open && <ResourceFormModal open onClose={() => setOpen(false)} />}
      {edit && <ResourceFormModal open onClose={() => setEdit(undefined)} resource={edit} />}
      <Confirm open={!!del} onClose={() => setDel(undefined)} title="Delete resource?" message={`"${del?.title}" will be permanently deleted.`} loading={remove.isPending}
        onConfirm={() => del && remove.mutate(del.id, { onSuccess: () => { toast.success('Resource deleted'); setDel(undefined) }, onError: (e) => toast.error(errMsg(e)) })} />
    </>
  )
}
