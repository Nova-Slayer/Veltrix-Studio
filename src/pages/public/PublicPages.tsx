import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, BookMarked, CheckSquare, FolderKanban, Lock, Zap } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import PlanComparison from './PlanComparison'

const features = [
  { icon: FolderKanban, t: 'Projects', d: 'Status, priority, deadlines, colors and notes, with progress calculated from tasks.' },
  { icon: CheckSquare, t: 'Tasks', d: 'List and board views, filters, due dates and overdue indicators.' },
  { icon: BookMarked, t: 'Resource vault', d: 'Save links, docs, tools and notes with tags and favorites.' },
  { icon: BarChart3, t: 'Analytics', d: 'Charts computed from your real data. Never padded with samples.' },
  { icon: Lock, t: 'Private by design', d: 'Row Level Security keeps every record visible only to its owner.' },
  { icon: Zap, t: 'Fast and focused', d: 'A minimal interface with keyboard-friendly, accessible controls.' },
]
const steps = [['Create an account', 'Sign up with email and verify it.'], ['Add projects and tasks', 'Capture what you are building and what is next.'], ['Track and launch', 'Watch progress and keep resources close.']]
const faqs = [
  ['Is there a free plan?', 'Yes. Free includes core task management, the resource vault, basic analytics and up to 3 active projects.'],
  ['Can I upgrade to Pro?', 'Pro billing is not open yet. The plan is shown honestly as unavailable until payments are configured.'],
  ['Who can see my data?', 'Only you. Access is enforced in the database with Row Level Security.'],
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mx-auto max-w-6xl px-4 py-14"><h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">{title}</h2>{children}</section>
}
const FeatureGrid = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: I, t, d }) => (
    <Card key={t}><I className="mb-3 h-6 w-6 text-brand2" aria-hidden /><h3 className="mb-1 font-semibold">{t}</h3><p className="text-sm text-mute">{d}</p></Card>))}</div>
)

function Preview() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-side p-4" aria-label="Illustrative dashboard preview">
      <div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium">Dashboard</span><Badge tone="warn">Illustrative preview, not real data</Badge></div>
      <div className="grid grid-cols-3 gap-3 text-center">{['Projects', 'Done', 'Pending'].map((l) => <div key={l} className="rounded-xl bg-card p-3"><p className="text-xl font-semibold">—</p><p className="text-xs text-mute">{l}</p></div>)}</div>
      <div className="mt-3 space-y-2">{[70, 45, 20].map((w) => <div key={w} className="h-2 rounded-full bg-raised"><div className="h-2 rounded-full bg-brand" style={{ width: `${w}%` }} /></div>)}</div>
    </div>
  )
}

export function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Badge tone="brand">Build. Organize. Launch.</Badge>
        <h1 className="mt-5 bg-gradient-to-b from-ink to-brand2 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">Your projects, workflow, and creator resources in one focused workspace.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-mute">Veltrix Studio helps developers, indie hackers, freelancers and creators plan projects, track tasks and keep their resources close.</p>
        <div className="mt-8 flex justify-center gap-3"><Link to="/signup"><Button className="px-5 py-3">Get started free</Button></Link><Link to="/features"><Button variant="outline" className="px-5 py-3">See features</Button></Link></div>
      </section>
      <Section title="Everything you need to ship"><FeatureGrid /></Section>
      <Section title="See the workspace"><Preview /></Section>
      <Section title="How it works"><div className="grid gap-4 md:grid-cols-3">{steps.map(([t, d], i) => <Card key={t}><span className="text-sm text-brand2">Step {i + 1}</span><h3 className="my-1 font-semibold">{t}</h3><p className="text-sm text-mute">{d}</p></Card>)}</div></Section>
      <Section title="Free vs Pro"><PlanComparison /></Section>
      <Section title="FAQ"><div className="mx-auto max-w-2xl space-y-3">{faqs.map(([q, a]) => <details key={q} className="rounded-xl border border-line bg-card p-4"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-sm text-mute">{a}</p></details>)}</div></Section>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center"><h2 className="text-3xl font-semibold">Ready to build?</h2><Link to="/signup"><Button className="mt-6 px-6 py-3">Create your free account</Button></Link></section>
    </>
  )
}
export const FeaturesPage = () => <Section title="Features"><FeatureGrid /></Section>
export const PricingPage = () => <Section title="Pricing"><PlanComparison /></Section>
export const AboutPage = () => <Section title="About"><p className="mx-auto max-w-2xl text-center text-mute">Veltrix Studio is a focused workspace for people who build things. It keeps projects, tasks and reference material together without the clutter.</p></Section>

export function ContactPage() {
  const email = import.meta.env.VITE_CONTACT_EMAIL as string | undefined
  return <Section title="Contact"><p className="mx-auto max-w-md text-center text-mute">{email ? <>Email us at <a className="text-brand2" href={`mailto:${email}`}>{email}</a>.</> : 'A contact address has not been configured yet. Set VITE_CONTACT_EMAIL to show one here.'}</p></Section>
}
const Legal = ({ title, children }: { title: string; children: ReactNode }) => (
  <Section title={title}><div className="mx-auto max-w-2xl space-y-3 text-sm text-mute"><p className="rounded-lg border border-warn/40 bg-warn/10 p-3 text-warn">Template text. Have it reviewed by a qualified professional before launch.</p>{children}</div></Section>
)
export const PrivacyPage = () => <Legal title="Privacy Policy"><p>We store your account email and the projects, tasks and resources you create so the service can work. Data is protected by per-user access rules. We do not sell personal data.</p><p>Payment details, if billing is enabled, are handled by the payment provider and not stored by us.</p></Legal>
export const TermsPage = () => <Legal title="Terms of Service"><p>You are responsible for your account and content. The service is provided as is during the MVP phase. We may change features and plans with notice.</p></Legal>
export const NotFoundPage = () => <Section title="Page not found"><div className="text-center"><Link to="/"><Button>Go home</Button></Link></div></Section>
