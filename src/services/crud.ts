import { db } from '@/lib/supabase'
import type { Activity } from '@/types'

type Entity = Activity['entity_type']

/** Best-effort activity log; user_id defaults to auth.uid() in the database. */
export async function logActivity(entity_type: Entity, entity_id: string, action: Activity['action']) {
  const { error } = await db().from('activity_logs').insert({ entity_type, entity_id, action })
  if (error) console.warn('activity log failed', error.message)
}

export function crud<T extends { id: string }, I extends object>(table: string, entity: Entity) {
  return {
    async list(): Promise<T[]> {
      const { data, error } = await db().from(table).select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as T[]
    },
    async create(input: I): Promise<T> {
      const { data, error } = await db().from(table).insert(input).select().single()
      if (error) throw error
      void logActivity(entity, (data as T).id, 'created')
      return data as T
    },
    async update(id: string, input: Partial<I>): Promise<T> {
      const { data, error } = await db().from(table).update(input).eq('id', id).select().single()
      if (error) throw error
      const done = (input as { status?: string }).status === 'done' && entity === 'task'
      void logActivity(entity, id, done ? 'completed' : 'updated')
      return data as T
    },
    async remove(id: string): Promise<void> {
      const { error } = await db().from(table).delete().eq('id', id)
      if (error) throw error
      void logActivity(entity, id, 'deleted')
    },
  }
}
