import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, BarChart3, BookMarked, ChevronLeft, ChevronRight, CheckSquare, CreditCard, FolderKanban, LayoutDashboard, LogOut, Menu, Search, Settings, X } from 'lucide-react'
import { Logo, LogoMark } from '@/components/Logo'
import { cn, fmtDate, isOverdue } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { taskHooks, useProfile } from '@/hooks/data'

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  { to: '/app/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/app/resources', label: 'Resources', icon: BookMarked },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/billing', label: 'Billing', icon: CreditCard },
]

function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="App" className="flex flex-col gap-1 p-3">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} title={label}
          className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm', isActive ? 'bg-brand/15 text-brand2' : 'text-mute hover:bg-raised hover:text-ink', collapsed && 'justify-center')}>
          <Icon className="h-4 w-4 shrink-0" aria-hidden />{!collapsed && label}
        </NavLink>
      ))}
    </nav>
  )
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean).slice(1)
  return (
    <div className="hidden text-sm text-mute sm:block" aria-label="Breadcrumb">
      <Link to="/app" className="hover:text-ink">App</Link>
      {parts.map((p, i) => <span key={i}> / <span className={i === parts.length - 1 ? 'text-ink' : ''}>{p.length > 20 ? 'Detail' : p.charAt(0).toUpperCase() + p.slice(1)}</span></span>)}
    </div>
  )
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [bell, setBell] = useState(false)
  const [menu, setMenu] = useState(false)
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const { data: tasks } = taskHooks.useList()
  const nav2 = useNavigate()
  const overdue = (tasks ?? []).filter(isOverdue)
  const name = profile?.display_name || user?.email?.split('@')[0] || 'User'

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim()
    nav2(q ? `/app/projects?q=${encodeURIComponent(q)}` : '/app/projects')
  }

  return (
    <div className="flex min-h-screen">
      <aside className={cn('hidden shrink-0 border-r border-line bg-side md:block', collapsed ? 'w-16' : 'w-60')}>
        <div className="flex h-16 items-center border-b border-line px-4">{collapsed ? <LogoMark /> : <Logo />}</div>
        <Sidebar collapsed={collapsed} />
      </aside>
      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobile(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside className="relative h-full w-64 bg-side" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-16 items-center justify-between border-b border-line px-4"><Logo /><button onClick={() => setMobile(false)} aria-label="Close menu"><X /></button></div>
            <Sidebar collapsed={false} onNavigate={() => setMobile(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur">
          <button className="md:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><Menu /></button>
          <button className="hidden rounded-md p-1 text-mute hover:text-ink md:block" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}</button>
          <Breadcrumbs />
          <form onSubmit={onSearch} role="search" className="ml-auto flex max-w-xs flex-1 items-center gap-2 rounded-lg border border-line bg-raised px-3">
            <Search className="h-4 w-4 text-mute" aria-hidden />
            <input name="q" aria-label="Search projects" placeholder="Search projects…" className="w-full bg-transparent py-2 text-sm placeholder:text-mute focus:outline-none" />
          </form>
          <div className="relative">
            <button onClick={() => { setBell(!bell); setMenu(false) }} aria-label="Notifications" className="relative rounded-md p-2 text-mute hover:text-ink">
              <Bell className="h-5 w-5" />{overdue.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-bad" />}
            </button>
            {bell && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-line bg-card p-3 shadow-xl">
                <p className="mb-2 text-sm font-medium">Notifications</p>
                {overdue.length === 0 ? <p className="text-sm text-mute">No overdue tasks.</p> : overdue.slice(0, 5).map((t) => (
                  <Link key={t.id} to="/app/tasks" onClick={() => setBell(false)} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-raised">
                    <span className="block truncate">{t.title}</span><span className="text-xs text-bad">Overdue since {fmtDate(t.due_date)}</span>
                  </Link>))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setMenu(!menu); setBell(false) }} aria-label="Account menu" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-sm font-semibold text-brand2">{name.charAt(0).toUpperCase()}</button>
            {menu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-card p-2 shadow-xl">
                <div className="px-2 py-1.5"><p className="truncate text-sm font-medium">{name}</p><p className="truncate text-xs text-mute">{user?.email}</p></div>
                <Link to="/app/settings" onClick={() => setMenu(false)} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-raised">Settings</Link>
                <button onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-bad hover:bg-raised"><LogOut className="h-4 w-4" />Sign out</button>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
