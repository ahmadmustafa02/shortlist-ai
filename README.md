# ShortlistAI

> AI-powered resume tailoring that helps job seekers get shortlisted. Upload your resume, paste a job description, pick how much time you have — and get a personalized fit score, skill-gap analysis, ATS optimization, tailoring tips, a time-aware prep roadmap, resume bullet rewrites, and likely interview questions.

---

<img width="1903" height="815" alt="image" src="https://github.com/user-attachments/assets/1fb17c35-8c86-4540-85cd-7d45dfef02d8" />

---

## Features

- **Resume PDF upload and extraction** — PDF text via `pdfjs-dist`, editable before analysis
- **Job description and timeline wizard** — resume → JD → time available
- **AI fit analysis** — Google **Gemini 2.5 Flash** from the `analyze-application` edge function, **JSON response mode**, structured report matching the app schema
- **Report** — fit score, ATS before/after, skill gaps, tailoring tips, time-aware prep roadmap, bullet rewrites, technical and behavioral interview questions with hints
- **History** — dashboard of past analyses
- **Auth** — email/password and Google OAuth via **Supabase Auth**
- **UI** — Tailwind + shadcn-style components, warm orange and cream palette

---

## Tech stack

| Layer        | Tech |
| ------------ | ---- |
| Frontend     | React 18, Vite 5, TypeScript, Tailwind CSS v3, shadcn-style UI |
| Routing      | React Router v6 |
| Data         | TanStack Query, React Hook Form, Zod (where used in the app) |
| Backend      | Supabase (Postgres, Auth, Edge Functions) |
| AI           | **Gemini** `generateContent` (v1beta), model `gemini-2.5-flash`, secret `GEMINI_API_KEY` |
| PDF          | `pdfjs-dist` (browser) |

---

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Local development

```bash
git clone <YOUR_GIT_URL>
cd <PROJECT_DIRECTORY>
npm install
npm run dev
```

Dev server: `http://localhost:8080` (see `vite.config.ts`).

### Scripts

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest watch mode
```

### Environment variables (frontend)

Create `.env` in the project root (Vite reads `VITE_*` variables):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
```

The generated client (`src/integrations/supabase/client.ts`) only reads those two. You can still set `VITE_SUPABASE_PROJECT_ID=<project-ref>` for your own tooling or docs.

Use values from your Supabase project settings. Do not commit real secrets to public repos.

---

## Project layout

```
src/
├── components/     # UI, analysis wizard steps, layout
├── hooks/          # e.g. useAuth
├── integrations/   # Supabase client
├── lib/            # analysis schema, PDF helpers, utils
├── pages/          # Landing, Auth, Dashboard, NewAnalysis, AnalysisResult, NotFound
├── types/          # report.ts (shared with API expectations)
├── App.tsx
├── main.tsx
└── index.css

supabase/
├── functions/analyze-application/   # Deno edge function (Gemini + DB insert)
├── migrations/                      # SQL migrations
└── config.toml                      # local Supabase / function settings
```

---

## Data model

| Table         | Purpose |
| ------------- | ------- |
| `profiles`    | `full_name`, `avatar_url`; row created on signup (trigger on `auth.users`) |
| `analyses`    | Per-run job metadata, resume/JD text, scores, `result_json` report |
| `user_roles`  | `admin` / `user`; `has_role()` for RLS |

All of these use Row Level Security so users only see their own data where applicable.

---

## AI architecture (`analyze-application`)

1. **Auth** — requires `Authorization: Bearer <user JWT>`; session checked with `getClaims()` (JWT verification at the gateway may be off in `config.toml` for ES256 compatibility — see `verify_jwt` there).
2. **Validation** — request JSON is checked in the function (job title, company, JD and resume length, allowed `timeBudget` enum).
3. **Gemini** — `POST` to `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` with `GEMINI_API_KEY`, `responseMimeType: application/json`, and a single user prompt that includes rules plus the JSON schema for the report.
4. **Parse** — `JSON.parse` on `candidates[0].content.parts[0].text`.
5. **Persist** — insert into `analyses` with the service role key; returns `{ id, report }` to the client (`NewAnalysis` navigates to `/analysis/:id`).

### Edge function secret

| Secret | Purpose |
| ------ | ------- |
| `GEMINI_API_KEY` | Google AI Studio / Gemini API key for `generateContent` |

Set it in the Supabase dashboard under **Project Settings → Edge Functions → Secrets**, or via CLI secrets management.

---

## Supabase CLI (link, migrations, deploy)

The CLI is included as a **devDependency** (`supabase`). Global `npm install -g supabase` is **not supported** by upstream; use `npx` from this repo.

```bash
npx supabase login                    # browser or: npx supabase login --token <access-token>
npx supabase link --project-ref <your-project-ref>
npx supabase db push                  # or migrate as you prefer
npx supabase functions deploy analyze-application
```

Use a [personal access token](https://supabase.com/dashboard/account/tokens) if you need non-interactive CI.

---

## Design system

- Cream background, burnt orange primary, charcoal text (semantic HSL tokens in `src/index.css` and `tailwind.config.ts`).

---

## Deployment

- **Frontend** — build with `npm run build`, host `dist/` on any static host; set the same `VITE_*` env vars.
- **Backend** — apply migrations and deploy `analyze-application` with the Supabase CLI; set `GEMINI_API_KEY` (and default Supabase env vars injected for functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.).

---

## Testing

```bash
npm run test
```

Vitest uses jsdom (`vitest.config.ts`). Tests live under `src/test/` when present.

---

## License

MIT — add a `LICENSE` file if you distribute the project.
