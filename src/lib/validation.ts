import { z } from 'zod'

const priority = z.enum(['low', 'medium', 'high'])

export const projectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Max 120 characters'),
  description: z.string().max(2000, 'Max 2000 characters'),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']),
  priority,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Pick a valid color'),
  deadline: z.string(),
})
export type ProjectForm = z.infer<typeof projectSchema>

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().max(5000, 'Max 5000 characters'),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority,
  due_date: z.string(),
  project_id: z.string(),
})
export type TaskForm = z.infer<typeof taskSchema>

const isHttpUrl = (v: string) => {
  if (v === '') return true
  try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false }
}
export const resourceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  url: z.string().max(2048).refine(isHttpUrl, 'Enter a valid http(s) URL'),
  description: z.string().max(2000, 'Max 2000 characters'),
  category: z.enum(['link', 'documentation', 'tutorial', 'tool', 'design', 'note']),
  tags: z.string().max(300),
})
export type ResourceForm = z.infer<typeof resourceSchema>

export const loginSchema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Password is required') })
export const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(72, 'Max 72 characters'),
})
export const emailSchema = z.object({ email: z.string().email('Enter a valid email') })
export const newPasswordSchema = z.object({ password: z.string().min(8, 'At least 8 characters').max(72) })
export const profileSchema = z.object({ display_name: z.string().trim().max(80, 'Max 80 characters') })

export const parseTags = (s: string) =>
  Array.from(new Set(s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 20)
