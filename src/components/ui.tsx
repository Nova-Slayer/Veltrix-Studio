import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'danger' | 'outline'
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand2 hover:text-bg',
  ghost: 'text-mute hover:text-ink hover:bg-raised',
  outline: 'border border-line text-ink hover:bg-raised',
  danger: 'bg-bad/15 text-bad hover:bg-bad/25',
}
export function Button({ variant = 'primary', className, loading, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button type="button" {...p} disabled={p.disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export const inputCls = 'w-full rounded-lg border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-brand'

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span role="alert" className="block text-xs text-bad">{error}</span>}
    </label>
  )
}

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('rounded-2xl border border-line bg-card p-5', className)}>{children}</div>
)

const tones: Record<string, string> = {
  default: 'bg-raised text-mute', ok: 'bg-ok/15 text-ok', warn: 'bg-warn/15 text-warn', bad: 'bg-bad/15 text-bad', brand: 'bg-brand/15 text-brand2',
}
export const Badge = ({ tone = 'default', children }: { tone?: keyof typeof tones; children: ReactNode }) => (
  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
)
export const priorityTone = (p: string) => (p === 'high' ? 'bad' : p === 'medium' ? 'warn' : 'default')
export const statusTone = (s: string) => (s === 'completed' || s === 'done' ? 'ok' : s === 'active' || s === 'in_progress' ? 'brand' : s === 'on_hold' ? 'warn' : 'default')

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-card p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-mute hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ open, onClose, onConfirm, title, message, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-sm text-mute">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </div>
    </Modal>
  )
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <div className="mb-3 text-brand2">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-mute">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export const Skeleton = ({ className }: { className?: string }) => <div className={cn('animate-pulse rounded-xl bg-raised', className)} />
export const ListSkeleton = () => <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>

export function ErrorBox({ message = 'Could not load data.' }: { message?: string }) {
  return <div role="alert" className="rounded-xl border border-bad/40 bg-bad/10 p-4 text-sm text-bad">{message}</div>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}</div>
      {action}
    </div>
  )
}

export function ProgressBar({ value, color = '#8B5CF6' }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}
