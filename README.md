# Veltrix Studio — Build. Organize. Launch.

React + TypeScript + Vite + Tailwind front end, Supabase (Postgres, Auth, RLS) back end, Netlify hosting.

## Status (honest table)

| Feature | Status | Verified | Remaining |
|---|---|---|---|
| Public site (7 routes) | Written | Not built or run | Install, build, visual check |
| Auth (signup/login/reset/callback) | Written | Not run | Configure Supabase URLs, test email flow |
| Projects / Tasks / Resources CRUD | Written | Not run | Manual test, 2-user isolation test |
| Dashboard / Analytics | Written | Not run | Test with real data |
| SQL schema + RLS + 3-project free limit | Written | Not applied to a DB | Apply migration, test allowed/denied access |
| Settings (name, email pref) | Written | Not run | |
| Billing / Stripe | Not implemented | n/a | Edge Function for checkout + signed webhook |
| Account deletion | Not implemented | n/a | Edge Function using service role |
| Lint (ESLint) | Not implemented | n/a | Add config |
| Unit tests (progress, overdue, weekly buckets) | Written | Not run | `npm test` |
| E2E tests | Not implemented | n/a | Playwright |

## Setup
1. `npm install`
2. Create a Supabase project. Run `supabase/migrations/20261023000001_core_schema.sql` in the SQL editor.
3. `cp .env.example .env.local`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings > API).
4. Supabase > Authentication > URL Configuration: Site URL `http://localhost:5173`, redirect URLs `http://localhost:5173/**` and your Netlify URL `/**`.
5. `npm run dev`

## Commands
`npm run dev` · `npm run typecheck` · `npm test` · `npm run build` · `npm run preview`

## Deploy (Netlify)
Connect the repo. Build `npm run build`, publish `dist` (already in `netlify.toml`, with SPA redirect). Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Site settings > Environment variables. Add the Netlify URL to Supabase redirect URLs. Rollback: Netlify > Deploys > publish a previous deploy.

## Design decisions
- Progress = done tasks / all tasks. Free limit = 3 non-completed projects, enforced by a DB trigger.
- Tasks use a composite FK `(project_id, user_id)` so a task cannot reference another user's project.
- `subscriptions` is read-only to users; only a service-role webhook may write it.
- Search/filter/sort run client-side over up to ~1000 rows per table (no pagination yet).
- Dark theme only. No service-role key is ever used in the browser.

## Known limitations
No CSP header yet (add after confirming Supabase origins), modals lack a focus trap, no avatar upload, notification email preference is stored but unused.
