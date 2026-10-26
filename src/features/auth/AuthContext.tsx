import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Session, User } from '@supabase/supabase-js'
import { isConfigured, supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'
import { Card, Skeleton } from '@/components/ui'

interface AuthState { session: Session | null; user: User | null; loading: boolean; signOut: () => Promise<void> }
const Ctx = createContext<AuthState>({ session: null, user: null, loading: true, signOut: async () => {} })
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const signOut = async () => { await supabase?.auth.signOut() }
  return <Ctx.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>{children}</Ctx.Provider>
}

export function SetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-lg space-y-3">
        <Logo />
        <h1 className="text-xl font-semibold">Backend setup required</h1>
        <p className="text-sm text-mute">
          Supabase is not configured, so sign-in and data storage are unavailable. Nothing is simulated.
          Copy <code className="text-brand2">.env.example</code> to <code className="text-brand2">.env.local</code>, set{' '}
          <code className="text-brand2">VITE_SUPABASE_URL</code> and <code className="text-brand2">VITE_SUPABASE_ANON_KEY</code>,
          apply the SQL migration, then restart the dev server. See README.md.
        </p>
      </Card>
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (!isConfigured) return <SetupScreen />
  if (loading) return <div className="p-8"><Skeleton className="h-40" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}
