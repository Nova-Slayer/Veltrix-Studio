import clsx, { type ClassValue } from 'clsx'
import type { Task } from '@/types'

export const cn = (...a: ClassValue[]) => clsx(a)

export const todayStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const isOverdue = (t: Pick<Task, 'due_date' | 'status'>) =>
  !!t.due_date && t.status !== 'done' && t.due_date < todayStr()

/** Project progress rule: done tasks / all tasks, rounded. 0 when a project has no tasks. */
export function progress(tasks: Pick<Task, 'status'>[]): number {
  if (tasks.length === 0) return 0
  return Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
}

/** Completed-task counts for the last `weeks` weeks, oldest first. */
export function completedPerWeek(tasks: Pick<Task, 'completed_at'>[], weeks = 8, now = Date.now()): number[] {
  const out = new Array<number>(weeks).fill(0)
  const week = 7 * 24 * 3600 * 1000
  for (const t of tasks) {
    if (!t.completed_at) continue
    const ago = Math.floor((now - new Date(t.completed_at).getTime()) / week)
    if (ago >= 0 && ago < weeks) out[weeks - 1 - ago] += 1
  }
  return out
}

export const fmtDate = (s: string | null) =>
  s ? new Date(s.length === 10 ? s + 'T00:00:00' : s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export function errMsg(e: unknown): string {
  const m = (e as { message?: string } | null)?.message ?? ''
  if (m.includes('PLAN_LIMIT')) return 'Free plan allows up to 3 active projects. Complete or delete one to add another.'
  console.error(e)
  return 'Something went wrong. Please try again.'
}

export const LABELS: Record<string, string> = {
  planning: 'Planning', active: 'Active', on_hold: 'On Hold', completed: 'Completed',
  todo: 'To do', in_progress: 'In progress', done: 'Done', low: 'Low', medium: 'Medium', high: 'High',
  link: 'Link', documentation: 'Documentation', tutorial: 'Tutorial', tool: 'Tool', design: 'Design', note: 'Note',
}
