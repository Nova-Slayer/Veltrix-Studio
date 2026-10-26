export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed'
export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type ResourceCategory = 'link' | 'documentation' | 'tutorial' | 'tool' | 'design' | 'note'

export interface Project {
  id: string; user_id: string; name: string; description: string | null; notes: string | null
  status: ProjectStatus; priority: Priority; color: string; deadline: string | null
  created_at: string; updated_at: string
}
export interface Task {
  id: string; user_id: string; project_id: string | null; title: string; description: string | null
  status: TaskStatus; priority: Priority; due_date: string | null; completed_at: string | null
  created_at: string; updated_at: string
}
export interface Resource {
  id: string; user_id: string; title: string; url: string | null; description: string | null
  category: ResourceCategory; tags: string[]; is_favorite: boolean; created_at: string; updated_at: string
}
export interface Activity {
  id: string; entity_type: 'project' | 'task' | 'resource'; entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'completed'; created_at: string
}
export interface Profile { id: string; display_name: string | null; avatar_url: string | null; notify_email: boolean }
export interface Subscription { plan: 'free' | 'pro'; status: string; current_period_end: string | null }

export type ProjectInput = Pick<Project, 'name' | 'description' | 'notes' | 'status' | 'priority' | 'color' | 'deadline'>
export type TaskInput = Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'project_id'>
export type ResourceInput = Pick<Resource, 'title' | 'url' | 'description' | 'category' | 'tags' | 'is_favorite'>
