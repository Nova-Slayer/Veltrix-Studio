import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, RequireAuth } from '@/features/auth/AuthContext'
import { AuthCallbackPage, ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage } from '@/features/auth/AuthPages'
import PublicLayout from '@/components/layout/PublicLayout'
import AppLayout from '@/components/layout/AppLayout'
import { AboutPage, ContactPage, FeaturesPage, HomePage, NotFoundPage, PricingPage, PrivacyPage, TermsPage } from '@/pages/public/PublicPages'
import DashboardPage from '@/pages/app/DashboardPage'
import ProjectsPage from '@/pages/app/ProjectsPage'
import ProjectDetailPage from '@/pages/app/ProjectDetailPage'
import TasksPage from '@/pages/app/TasksPage'
import ResourcesPage from '@/pages/app/ResourcesPage'
import AnalyticsPage from '@/pages/app/AnalyticsPage'
import SettingsPage from '@/pages/app/SettingsPage'
import BillingPage from '@/pages/app/BillingPage'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1 } } })

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="billing" element={<BillingPage />} />
            </Route>
            <Route element={<PublicLayout />}><Route path="*" element={<NotFoundPage />} /></Route>
          </Routes>
        </BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}
