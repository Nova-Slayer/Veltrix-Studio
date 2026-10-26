import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'

const links = [['/features', 'Features'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact']]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="Veltrix Studio home"><Logo /></Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {links.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => `text-sm ${isActive ? 'text-ink' : 'text-mute hover:text-ink'}`}>{l}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? <Link to="/app"><Button>Open app</Button></Link> : <>
              <Link to="/login"><Button variant="ghost">Log in</Button></Link>
              <Link to="/signup"><Button>Get started</Button></Link></>}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="space-y-1 border-t border-line px-4 py-3 md:hidden">
            {links.map(([to, l]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2 text-sm text-mute hover:bg-raised hover:text-ink">{l}</Link>)}
            <Link to={user ? '/app' : '/signup'} onClick={() => setOpen(false)} className="block rounded-lg bg-brand px-2 py-2 text-center text-sm font-medium">{user ? 'Open app' : 'Get started'}</Link>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-mute sm:flex-row">
          <Logo />
          <div className="flex gap-5"><Link to="/privacy" className="hover:text-ink">Privacy</Link><Link to="/terms" className="hover:text-ink">Terms</Link><Link to="/contact" className="hover:text-ink">Contact</Link></div>
          <span>Build. Organize. Launch.</span>
        </div>
      </footer>
    </div>
  )
}
