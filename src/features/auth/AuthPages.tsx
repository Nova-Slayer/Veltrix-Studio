import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Button, Card, Field, inputCls } from '@/components/ui'
import { Logo } from '@/components/Logo'
import { db, isConfigured } from '@/lib/supabase'
import { emailSchema, loginSchema, newPasswordSchema, signupSchema } from '@/lib/validation'
import { SetupScreen, useAuth } from './AuthContext'

function Shell({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  if (!isConfigured) return <SetupScreen />
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm space-y-5">
        <Link to="/" aria-label="Home"><Logo /></Link>
        <h1 className="text-xl font-semibold">{title}</h1>
        {children}
        {footer && <div className="text-center text-sm text-mute">{footer}</div>}
      </Card>
    </div>
  )
}
const authError = (m: string) => (/invalid login/i.test(m) ? 'Incorrect email or password.' : /not confirmed/i.test(m) ? 'Please verify your email first.' : /rate|too many/i.test(m) ? 'Too many attempts. Try again shortly.' : 'Something went wrong. Please try again.')

export function LoginPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) })
  if (user) return <Navigate to="/app" replace />
  return (
    <Shell title="Log in" footer={<><Link to="/forgot-password" className="text-brand2">Forgot password?</Link> · <Link to="/signup" className="text-brand2">Create account</Link></>}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
        const { error } = await db().auth.signInWithPassword(v)
        if (error) toast.error(authError(error.message)); else nav((loc.state as { from?: string } | null)?.from ?? '/app', { replace: true })
      })}>
        <Field label="Email" error={errors.email?.message}><input type="email" autoComplete="email" className={inputCls} {...register('email')} /></Field>
        <Field label="Password" error={errors.password?.message}><input type="password" autoComplete="current-password" className={inputCls} {...register('password')} /></Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>
    </Shell>
  )
}

export function SignupPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema) })
  if (sent) return <Shell title="Check your email"><p className="text-sm text-mute">We sent a verification link. Open it to activate your account, then log in.</p><Link to="/login"><Button className="w-full">Go to login</Button></Link></Shell>
  return (
    <Shell title="Create your account" footer={<>Already have an account? <Link to="/login" className="text-brand2">Log in</Link></>}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
        const { error } = await db().auth.signUp({ ...v, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
        if (error) toast.error(authError(error.message)); else setSent(true)
      })}>
        <Field label="Email" error={errors.email?.message}><input type="email" autoComplete="email" className={inputCls} {...register('email')} /></Field>
        <Field label="Password" error={errors.password?.message}><input type="password" autoComplete="new-password" className={inputCls} {...register('password')} /></Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>Sign up</Button>
      </form>
    </Shell>
  )
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) })
  return (
    <Shell title="Reset password" footer={<Link to="/login" className="text-brand2">Back to login</Link>}>
      {sent ? <p className="text-sm text-mute">If an account exists for that email, a reset link is on its way.</p> : (
        <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
          await db().auth.resetPasswordForEmail(v.email, { redirectTo: `${window.location.origin}/reset-password` })
          setSent(true)  // same message whether or not the account exists
        })}>
          <Field label="Email" error={errors.email?.message}><input type="email" className={inputCls} {...register('email')} /></Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Send reset link</Button>
        </form>)}
    </Shell>
  )
}

export function ResetPasswordPage() {
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof newPasswordSchema>>({ resolver: zodResolver(newPasswordSchema) })
  return (
    <Shell title="Choose a new password">
      {!loading && !user ? <p className="text-sm text-mute">This reset link is invalid or expired. <Link to="/forgot-password" className="text-brand2">Request a new one</Link>.</p> : (
        <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => {
          const { error } = await db().auth.updateUser({ password: v.password })
          if (error) toast.error('Could not update password. The link may have expired.'); else { toast.success('Password updated'); nav('/app') }
        })}>
          <Field label="New password" error={errors.password?.message}><input type="password" autoComplete="new-password" className={inputCls} {...register('password')} /></Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Update password</Button>
        </form>)}
    </Shell>
  )
}

export function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const nav = useNavigate()
  useEffect(() => { if (!loading) nav(user ? '/app' : '/login', { replace: true }) }, [user, loading, nav])
  return <Shell title="Signing you in…"><p className="text-sm text-mute">One moment.</p></Shell>
}
