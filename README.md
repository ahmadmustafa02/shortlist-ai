<div align="center">

# Shortlist AI

**Tailor your resume to a real job posting — get a fit analysis, gaps, and prep ideas in one flow.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Edge%20Functions-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)

<br />

<!-- Add screenshot here -->
<img width="1903" height="810" alt="image" src="https://github.com/user-attachments/assets/2937f2c0-7437-4cf4-a9b3-de7de8daaa81" />

<!-- Example: ![App screenshot](./docs/screenshot.png) -->

</div>

---

## Features

- **Guided workflow** — Resume (PDF or paste) → job details → time budget → one-click analysis  
- **Structured reports** — Fit-oriented scores, skill gaps, prep roadmap, and interview-style prompts  
- **PDF text extraction** — Client-side parsing before send; edit the text before analysis  
- **Supabase Auth** — Email/password and Google sign-in; analyses scoped per user  
- **Modern UI** — React, Tailwind, accessible primitives (Radix)  

---

## Tech stack

| Layer | Technologies |
| ----- | -------------- |
| **Frontend** | React 18 · Vite 5 · TypeScript · Tailwind CSS · React Router |
| **Backend** | Supabase (Postgres, Auth, Row Level Security) |
| **AI** | Google Gemini via Edge Function (`analyze-application`) |
| **PDF** | `pdfjs-dist` in the browser |

---

## Getting started

### Prerequisites

- **Node.js** 18+  
- **npm**  
- A **Supabase** project with Auth enabled and the `analyze-application` function deployed (see `supabase/`)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/shortlist-ai.git
cd shortlist-ai
npm install
npm run dev
```

The dev server runs at **http://localhost:5173** (see `vite.config.ts`).

```bash
npm run build    # production bundle → dist/
npm run preview  # serve dist locally
npm run test     # Vitest
npm run lint     # ESLint
```

### Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
| -------- | ----------- |
| `VITE_SUPABASE_URL` | Project URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key (safe in the browser with RLS) |
| `VITE_SUPABASE_PROJECT_ID` | Optional project ref for your own docs/tooling |

Never commit real secrets. `.env` is gitignored.

---

## Architecture

1. The **browser** calls Supabase Auth and invokes the **`analyze-application`** Edge Function with resume text, JD, and metadata.  
2. The **Edge Function** validates the payload, calls **Gemini** with a JSON-shaped prompt, and parses the model output.  
3. Results are **written to Postgres** via the service role; the function returns the new **analysis id** so the app can route to `/analysis/:id`.  
4. **RLS** on `analyses` (and related tables) ensures users only read their own rows.

---

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first so we can align on scope.

---

## License

See [LICENSE](LICENSE).
