import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crud } from '@/services/crud'
import { db } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import type { Activity, Profile, Project, ProjectInput, Resource, ResourceInput, Subscription, Task, TaskInput } from '@/types'

const projectsSvc = crud<Project, ProjectInput>('projects', 'project')
const tasksSvc = crud<Task, TaskInput>('tasks', 'task')
const resourcesSvc = crud<Resource, ResourceInput>('resources', 'resource')

function make<T extends { id: string }, I extends object>(
  key: string,
  svc: ReturnType<typeof crud<T, I>>,
  also: string[] = [],
) {
  const useList = () => {
    const { user } = useAuth()
    return useQuery({ queryKey: [key, user?.id], queryFn: svc.list, enabled: !!user })
  }
  const useSave = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, input }: { id?: string; input: Partial<I> }) =>
        id ? svc.update(id, input) : svc.create(input as I),
      onSuccess: () => { for (const k of [key, 'activity', ...also]) void qc.invalidateQueries({ queryKey: [k] }) },
    })
  }
  const useRemove = () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => svc.remove(id),
      onSuccess: () => { for (const k of [key, 'activity', ...also]) void qc.invalidateQueries({ queryKey: [k] }) },
    })
  }
  return { useList, useSave, useRemove }
}

export const projectHooks = make<Project, ProjectInput>('projects', projectsSvc, ['tasks'])
export const taskHooks = make<Task, TaskInput>('tasks', tasksSvc)
export const resourceHooks = make<Resource, ResourceInput>('resources', resourcesSvc)

export function useActivity(limit = 10) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['activity', user?.id, limit], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db().from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit)
      if (error) throw error
      return data as Activity[]
    },
  })
}

export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db().from('profiles').select('id,display_name,avatar_url,notify_email').single()
      if (error) throw error
      return data as Profile
    },
  })
}
export function useUpdateProfile() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, 'display_name' | 'notify_email'>>) => {
      const { error } = await db().from('profiles').update(patch).eq('id', user?.id ?? '')
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useSubscription() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['subscription', user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db().from('subscriptions').select('plan,status,current_period_end').maybeSingle()
      if (error) throw error
      return (data ?? { plan: 'free', status: 'active', current_period_end: null }) as Subscription
    },
  })
}
