# Job Tracker — Frontend

Web interface for **Job Tracker**, a job application tracker that scores how well your resume matches each job offer using AI.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS 4**. It talks to a separate Spring Boot API (`backend-api`).

## Features

- **Authentication** — sign up, log in and log out. The session is a JWT stored in an `HttpOnly` cookie set by the API; expired sessions redirect to the login page.
- **Dashboard** — every application as a card with its status, creation date and AI match score.
  - Filter by status (with counts), search by company or job title (accent-insensitive), sort by date, company or best match.
  - Inline status change (optimistic update with rollback on failure).
  - Inline edit of company and job title.
  - Delete with a confirmation dialog.
  - Expandable view of the original job description.
- **New application** — add a company, a job title and optionally the job description. When a description is provided, the API compares it with your resume and returns a match score and the missing skills.
- **Profile** — see your account email and whether a resume is on file, and upload or replace your resume (PDF, 1 MB max).
- **UX details** — loading skeletons, toast notifications that persist across navigation, accessible forms (linked labels, `autoComplete`, password visibility toggle), per-page titles, custom 404 and error pages.

## Tech stack

| Area      | Choice                                                          |
| --------- | --------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                              |
| UI        | React 19, Tailwind CSS 4, Fraunces / Plus Jakarta Sans / IBM Plex Mono |
| Language  | TypeScript (strict)                                             |
| Tests     | Vitest                                                          |
| Linting   | ESLint (`eslint-config-next`)                                   |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- The `backend-api` running (by default on `http://localhost:8080`) with its PostgreSQL database

The API only accepts cross-origin requests from `http://localhost:3000` (see the backend `SecurityConfig`), so run the frontend on that port.

### Installation

```bash
npm install
cp .env.example .env.local   # then adjust if needed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root URL redirects to `/login`.

### Environment variables

| Variable              | Default                 | Description                                   |
| --------------------- | ----------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL of the Spring Boot API (no trailing slash). |

## Scripts

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start the development server        |
| `npm run build` | Build for production                |
| `npm run start` | Serve the production build          |
| `npm run lint`  | Run ESLint                          |
| `npm test`      | Run the unit tests once with Vitest |

## Project structure

```
src/
├── app/                      # Routes (App Router)
│   ├── login/ register/      # Authentication pages
│   ├── dashboard/            # Shared header layout + application list
│   │   ├── new/              # New application form
│   │   └── profile/          # Account info and resume upload
│   ├── error.tsx             # Error boundary
│   └── not-found.tsx         # 404 page
├── components/               # UI components (cards, dialog, toasts, header…)
├── hooks/                    # Client hooks (current user, session expiry)
└── lib/                      # Framework-free logic, unit tested
    ├── api.ts                # fetch wrapper (base URL + credentials)
    ├── applications.ts       # Types, filtering, sorting, scoring
    ├── user.ts               # Current user profile
    └── validation.ts         # Form validation rules
```

## API endpoints used

| Method | Endpoint                         | Purpose                       |
| ------ | -------------------------------- | ----------------------------- |
| POST   | `/api/users`                     | Create an account             |
| POST   | `/api/auth/login`                | Log in (sets the JWT cookie)  |
| POST   | `/api/auth/logout`               | Log out (expires the cookie)  |
| GET    | `/api/users/me`                  | Current user profile          |
| POST   | `/api/users/me/resume`           | Upload the resume (PDF)       |
| GET    | `/api/applications`              | List applications             |
| POST   | `/api/applications`              | Create an application         |
| PUT    | `/api/applications/{id}`         | Edit company and job title    |
| PATCH  | `/api/applications/{id}/status`  | Change the status             |
| DELETE | `/api/applications/{id}`         | Delete an application         |
