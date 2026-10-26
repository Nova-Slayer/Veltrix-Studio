import { describe, expect, it } from 'vitest'
import { completedPerWeek, isOverdue, progress } from './utils'

describe('progress', () => {
  it('is 0 with no tasks', () => expect(progress([])).toBe(0))
  it('counts done tasks', () =>
    expect(progress([{ status: 'done' }, { status: 'todo' }, { status: 'in_progress' }, { status: 'done' }])).toBe(50))
})
describe('isOverdue', () => {
  it('ignores done tasks', () => expect(isOverdue({ due_date: '2000-01-01', status: 'done' })).toBe(false))
  it('flags past open tasks', () => expect(isOverdue({ due_date: '2000-01-01', status: 'todo' })).toBe(true))
  it('ignores tasks without a due date', () => expect(isOverdue({ due_date: null, status: 'todo' })).toBe(false))
})
describe('completedPerWeek', () => {
  it('buckets by week, oldest first', () => {
    const now = Date.parse('2026-10-23T12:00:00Z')
    const day = 24 * 3600 * 1000
    const r = completedPerWeek(
      [{ completed_at: new Date(now - day).toISOString() }, { completed_at: new Date(now - 8 * day).toISOString() }, { completed_at: null }],
      3, now)
    expect(r).toEqual([0, 1, 1])
  })
})
