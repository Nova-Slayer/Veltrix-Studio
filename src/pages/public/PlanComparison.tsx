import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Badge, Card } from '@/components/ui'

const free = ['Up to 3 active projects', 'Unlimited tasks', 'Resource vault', 'Basic dashboard analytics']
const pro = ['Unlimited active projects', 'Everything in Free', 'Advanced analytics (planned)', 'Enhanced resource management (planned)']

export default function PlanComparison() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[['Free', '$0', free, false], ['Pro', 'Pricing to be announced', pro, true]].map(([n, price, feats, isPro]) => (
        <Card key={n as string} className={isPro ? 'border-brand/60' : ''}>
          <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{n as string}</h3>{isPro && <Badge tone="warn">Not yet available</Badge>}</div>
          <p className="my-3 text-2xl font-semibold">{price as string}</p>
          <ul className="space-y-2 text-sm">{(feats as string[]).map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-ok" aria-hidden />{f}</li>)}</ul>
          {!isPro && <Link to="/signup" className="mt-5 block rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium">Start free</Link>}
          {isPro && <p className="mt-5 text-xs text-mute">Pro checkout opens once billing is configured.</p>}
        </Card>))}
    </div>
  )
}
