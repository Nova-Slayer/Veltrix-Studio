import { Badge, Card, ErrorBox, PageHeader, Skeleton } from '@/components/ui'
import { projectHooks, useSubscription } from '@/hooks/data'
import { fmtDate } from '@/lib/utils'
import PlanComparison from '@/pages/public/PlanComparison'

export default function BillingPage() {
  const { data: sub, isLoading, isError } = useSubscription()
  const { data: projects } = projectHooks.useList()
  if (isLoading) return <Skeleton className="h-40" />
  if (isError) return <ErrorBox />
  const active = (projects ?? []).filter((p) => p.status !== 'completed').length
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" />
      <Card>
        <div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold">Current plan</h2><Badge tone="brand">{sub?.plan === 'pro' ? 'Pro' : 'Free'}</Badge></div>
        <p className="mt-2 text-sm text-mute">Active projects: {active}{sub?.plan === 'free' ? ' / 3' : ''}. {sub?.current_period_end && `Renews ${fmtDate(sub.current_period_end)}.`}</p>
        <div className="mt-4 rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn" role="status">
          <strong>Billing setup required.</strong> Stripe checkout is not configured in this build, so upgrading is unavailable. Plan status is read from the server and can only be changed by a verified payment webhook.
        </div>
      </Card>
      <PlanComparison />
    </div>
  )
}
