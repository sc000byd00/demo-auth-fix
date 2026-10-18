# Case study: fixing an AI-built Next.js + Supabase app

A small notes app, built with an AI app builder and handed over in a typical "90% done" state. This repository shows how I diagnosed and fixed it. The git history is the case study: tag `before` is the app as delivered, `main` is the fixed version, and every fix is its own commit with the root cause in the message.

## The brief

> Users sometimes get redirected to the login page after signing in.
> The dashboard occasionally fails to display the logged-in user's saved data.

## What I found

| # | Symptom | Root cause | Fix |
| --- | --- | --- | --- |
| 1 | Random logouts, back to `/login` | The middleware wrote refreshed auth cookies only onto the incoming request, never onto the response. The browser kept the old tokens; once the access token expired (default 1 h), the next refresh failed. | Write cookies and Supabase's cache headers onto the response, and onto the redirect too. [`4d06197`](../../commit/4d06197) |
| 2 | Empty dashboard after a page reload | The dashboard took the user from an in-memory cache that only the login page filled. After a reload it was empty, the query ran as `user_id=eq.undefined`, Postgres rejected it, and the error was swallowed. New notes were saved without a user for the same reason. | Load notes in a Server Component from the Supabase session, raise query errors, save notes through a Server Action. [`1da0378`](../../commit/1da0378) |
| 3 | Not reported: **every user's notes were public** | The `notes` table had no Row Level Security. The anon key ships to every browser, so anyone could read and change all notes through the Supabase REST API. | Enable RLS with owner-only policies. [`7680142`](../../commit/7680142) |

Issue 3 is the most serious one, and nobody had noticed it. Checking RLS is part of every review I do on Supabase apps.

## How it was verified

- Regression tests for the middleware and the notes logic (`npm test`, 9 tests). The middleware tests fail on the `before` version and pass on `main`.
- Type check, lint and production build pass.

## Run it yourself

1. Create a free Supabase project and run `supabase/schema.sql` in its SQL editor.
2. In Supabase under Authentication, add a test user (email + password).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
4. `npm install`, then `npm run dev`, and sign in at <http://localhost:3000/login>.

Compare the two states with `git diff before main`.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (`@supabase/ssr`), Vitest.

## About

I fix and finish AI-built web apps (Lovable, Bolt, Next.js, Supabase): auth and data bugs, integrations, deployment. I work AI-assisted with Claude Code and test every change myself. Fixed price, agreed scope, written acceptance criteria.
