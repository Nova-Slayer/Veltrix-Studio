import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Badge, Button, Card, Field, PageHeader, inputCls } from '@/components/ui'
import { useProfile, useSubscription, useUpdateProfile } from '@/hooks/data'
import { useAuth } from '@/features/auth/AuthContext'
import { profileSchema } from '@/lib/validation'
import { errMsg } from '@/lib/utils'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const { data: sub } = useSubscription()
  const update = useUpdateProfile()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ display_name: string }>({ resolver: zodResolver(profileSchema), defaultValues: { display_name: '' } })
  useEffect(() => reset({ display_name: profile?.display_name ?? '' }), [profile?.display_name, reset])
  const name = profile?.display_name || user?.email || 'U'

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" />
      <Card>
        <h2 className="mb-4 font-semibold">Profile</h2>
        <div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-lg font-semibold text-brand2">{name.charAt(0).toUpperCase()}</div><div><p className="text-sm text-mute">Email</p><p className="text-sm">{user?.email}</p></div></div>
        <form className="space-y-4" noValidate onSubmit={handleSubmit(async (v) => { try { await update.mutateAsync({ display_name: v.display_name || null }); toast.success('Profile saved') } catch (e) { toast.error(errMsg(e)) } })}>
          <Field label="Display name" error={errors.display_name?.message}><input className={inputCls} {...register('display_name')} /></Field>
          <Button type="submit" loading={update.isPending}>Save profile</Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold">Preferences</h2>
        <label className="flex items-center justify-between gap-4 text-sm"><span>Email notifications<span className="block text-xs text-mute">Stored preference. Email sending is not implemented yet.</span></span>
          <input type="checkbox" className="h-4 w-4 accent-brand" checked={profile?.notify_email ?? true} onChange={(e) => update.mutate({ notify_email: e.target.checked }, { onError: (er) => toast.error(errMsg(er)) })} /></label>
        <p className="mt-4 text-xs text-mute">Theme: Veltrix currently ships a dark theme only.</p>
      </Card>
      <Card><h2 className="mb-2 font-semibold">Plan</h2><p className="text-sm text-mute">Current plan: <Badge tone="brand">{sub?.plan === 'pro' ? 'Pro' : 'Free'}</Badge></p></Card>
      <Card>
        <h2 className="mb-2 font-semibold">Account</h2>
        <div className="flex flex-wrap items-center gap-3"><Button variant="outline" onClick={() => void signOut()}>Sign out</Button>
          <span className="text-xs text-mute">Account deletion: not available yet (needs a secure server-side function). Planned.</span></div>
      </Card>
    </div>
  )
}
