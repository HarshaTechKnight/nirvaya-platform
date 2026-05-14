# Co-Flare

> The Institutional Curator for India's Startup Ecosystem

A unified platform connecting Founders, Co-Founders, Freelancers, Business Owners, Mentors, and Investors across India. Built to remove friction between talent, capital, and knowledge in India.

**Status:** Active Development — Month 1 MVP
**Built by:** Surendra P. & Sri Harsha M. | Nirvaya Consultancy
**Location:** Vijayawada, Andhra Pradesh, India

---

## Table of Contents

1. Overview
2. Features
3. Tech Stack
4. Prerequisites
5. Getting Started
6. Environment Variables
7. Supabase Setup
8. Google OAuth Setup
9. Database Schema
10. Project Structure
11. Available Scripts
12. Design System
13. User Roles
14. Development Workflow
15. Deployment
16. Known Issues & Troubleshooting
17. Contributing
18. Roadmap
19. License
20. Contact

---

## 1. Overview

Nirvaya is a web-based startup ecosystem platform purpose-built for India. The platform is structured around three dedicated portals:

- **Founders Portal** — shared by Founders, Co-Founders, Freelancers, and Business Owners
- **Mentors Portal** — for experienced professionals guiding the ecosystem
- **Investor Portal** — for angel investors, VCs, and funding bodies

The design language is "institutional curator" — sophisticated editorial aesthetic with teal-green accents, warm cream backgrounds, and elegant serif typography. Think Ivy League meets modern fintech.

---

## 2. Features

### Month 1 (MVP — Current)

- Landing page with institutional design
- Google OAuth + email/password authentication
- Role selection screen (6 roles)
- Profile completion flow
- User profile pages with Executive Summary, Domain Expertise, Grant Progress
- Role-based portal routing

### Month 2 (Planned)

- Community Feed with posts, likes, and comments
- Direct Messaging with Supabase Realtime
- Smart Search with role, domain, location, and skill filters
- Grow Unit for mentors to upload courses and journals
- Startup Listings with Express Interest
- Mentor Session Booking

### Month 3 (Planned)

- Full Investor Portal with pitch deck viewing
- Admin Panel for verification and analytics
- AP Government Scheme integration
- Email notification system
- Telugu language support

---

## 3. Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Fraunces (display font) + Inter (body font)

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth (OAuth + email/password)
- Supabase Storage (files)
- Supabase Realtime (WebSocket)

**Deployment:**
- Vercel (frontend)
- Supabase Cloud (backend)
- GitHub (version control + CI/CD)

---

## 4. Prerequisites

Before you begin, make sure you have installed:

- Node.js 20.x or higher — https://nodejs.org
- npm (comes with Node.js) or yarn
- Git — https://git-scm.com
- A Supabase account — https://supabase.com
- A Google Cloud account (for OAuth) — https://console.cloud.google.com
- VS Code or any code editor

---

## 5. Getting Started

### Clone the repository

    git clone https://github.com/your-username/nirvaya-platform.git
    cd nirvaya-platform

### Install dependencies

    npm install

### Set up environment variables

Create a `.env.local` file in the project root (see section 6 below).

### Run the development server

    npm run dev

Open http://localhost:3000 in your browser. The landing page should appear.

---

## 6. Environment Variables

Create a `.env.local` file in the project root with these values:

    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
    NEXT_PUBLIC_SITE_URL=http://localhost:3000

Replace the placeholder values with your actual Supabase credentials. Never commit `.env.local` to git.

For production deployment on Vercel, add these same variables in the Vercel project settings under Environment Variables.

---

## 7. Supabase Setup

### Create a Supabase project

1. Go to https://supabase.com and sign up or log in
2. Click "New Project"
3. Name: `nirvaya-platform`
4. Database Password: choose a strong password and save it
5. Region: `ap-south-1` (Mumbai) — closest to AP users
6. Click "Create new project" and wait about 2 minutes

### Get your API credentials

Once created, go to **Settings → API** and copy:

- Project URL — paste into `NEXT_PUBLIC_SUPABASE_URL`
- anon public API key — paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Configure Auth URLs

Go to **Authentication → URL Configuration** and set:

- **Site URL:** `http://localhost:3000` (for development) or your production URL
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `https://your-production-url.vercel.app/auth/callback`

---

## 8. Google OAuth Setup

### Create Google OAuth credentials

1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `Nirvaya Platform`

### Configure authorized URIs

**Authorized JavaScript origins:**
- `http://localhost:3000`
- `https://your-production-url.vercel.app`

**Authorized redirect URIs:**
- `http://localhost:3000/auth/callback`
- `https://your-production-url.vercel.app/auth/callback`
- `https://your-project-id.supabase.co/auth/v1/callback`

The Supabase callback URI is critical — OAuth will fail without it.

### Enable Google provider in Supabase

1. Go to your Supabase project
2. Navigate to **Authentication → Providers → Google**
3. Toggle it on
4. Paste the Google Client ID and Client Secret from Google Cloud Console
5. Click Save

---

## 9. Database Schema

Run this SQL in the Supabase SQL Editor (**SQL Editor → New query**):

    create extension if not exists "uuid-ossp";

    create table public.profiles (
      id uuid references auth.users on delete cascade primary key,
      full_name text not null default '',
      email text not null default '',
      avatar_url text,
      role text,
      bio text,
      headline text,
      location text,
      company text,
      skills text[] default '{}',
      domains text[] default '{}',
      linkedin_url text,
      is_profile_complete boolean default false,
      is_verified boolean default false,
      connections_count int default 0,
      posts_count int default 0,
      created_at timestamptz default now()
    );

    create or replace function public.handle_new_user()
    returns trigger language plpgsql security definer set search_path = public as $$
    begin
      insert into public.profiles (id, full_name, email, avatar_url)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.email, ''),
        new.raw_user_meta_data->>'avatar_url'
      )
      on conflict (id) do nothing;
      return new;
    end;
    $$;

    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();

    alter table public.profiles enable row level security;

    create policy "Profiles viewable by authenticated"
      on profiles for select using (auth.role() = 'authenticated');

    create policy "Users insert own profile"
      on profiles for insert with check (auth.uid() = id);

    create policy "Users update own profile"
      on profiles for update using (auth.uid() = id);

After running the SQL, check the **Table Editor** in Supabase to confirm the `profiles` table exists.

---

## 10. Project Structure

    nirvaya-platform/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx                 # Root layout with fonts
    │   │   ├── page.tsx                   # Landing page
    │   │   ├── globals.css                # Tailwind + design system tokens
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx           # Login page
    │   │   │   ├── select-role/
    │   │   │   │   └── page.tsx           # Role selection
    │   │   │   ├── complete-profile/
    │   │   │   │   └── page.tsx           # Profile setup form
    │   │   │   └── callback/
    │   │   │       └── route.ts           # OAuth callback handler
    │   │   └── profile/
    │   │       ├── page.tsx               # Profile server component
    │   │       └── ProfileView.tsx        # Profile client UI
    │   └── lib/
    │       └── supabase/
    │           ├── client.ts              # Browser client
    │           └── server.ts              # Server client
    ├── public/
    │   └── images/                        # Platform images
    ├── .env.local                         # Environment variables (not in git)
    ├── .env.example                       # Template for environment variables
    ├── .gitignore
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── package.json
    └── README.md

---

## 11. Available Scripts

In the project directory, you can run:

### Development

    npm run dev

Starts the development server at http://localhost:3000. Hot reload on file save.

### Production build

    npm run build

Creates an optimized production build in the `.next` folder.

### Start production server

    npm start

Runs the production build locally. Must run `npm run build` first.

### Lint

    npm run lint

Runs ESLint on all source files.

### Type check

    npx tsc --noEmit

Checks TypeScript types without emitting files.

---

## 12. Design System

### Color palette

The design uses a warm, institutional palette defined in `src/app/globals.css`:

- **Cream** `#f7f5f0` — primary background
- **Cream Dark** `#efece4` — secondary surfaces
- **Teal** `#0f6e56` — primary brand accent
- **Teal Dark** `#0a4d3d` — hover and active states
- **Teal Light** `#d4e8e0` — subtle backgrounds and badges
- **Ink** `#0f1f1a` — primary text
- **Ink Soft** `#2d3e37` — secondary text
- **Muted** `#6b7b72` — tertiary text
- **Line** `#d8d4c7` — borders and dividers
- **Rust** `#b85c38` — secondary accent

### Typography

- **Display (headings):** Fraunces — serif with optical sizing
- **Body:** Inter — geometric sans-serif
- **Italic display:** Fraunces Italic — used for emphasis words like "Andhra Pradesh"

### Utility classes

- `font-display` — applies Fraunces serif
- `italic-display` — applies Fraunces italic style
- Tailwind color tokens: `bg-cream`, `text-teal`, `border-line`, etc.

---

## 13. User Roles

The platform supports six user roles, each with a specific portal assignment:

| Role            | Tag         | Portal          | Description                                        |
|-----------------|-------------|-----------------|----------------------------------------------------|
| Founder         | FOUNDER     | Founders        | Building an early-stage startup                    |
| Co-Founder      | CO-FOUNDER  | Founders        | Joining a startup as a partner                     |
| Freelancer      | FREELANCER  | Founders        | Offering services to AP startups                   |
| Business Owner  | BIZ OWNER   | Founders        | Scaling an existing offline business               |
| Mentor          | MENTOR      | Mentors         | Guiding founders with domain expertise             |
| Investor        | INVESTOR    | Investors       | Discovering and funding AP startups                |

Role is selected once at first login and stored in the `profiles.role` column. It cannot be changed later without admin intervention.

---

## 14. Development Workflow

### Git workflow

1. Create a feature branch from `main`:

       git checkout -b feature/your-feature-name

2. Make your changes and commit with descriptive messages:

       git add .
       git commit -m "feat: add startup listing card component"

3. Push to GitHub:

       git push -u origin feature/your-feature-name

4. Open a Pull Request on GitHub
5. Vercel will automatically create a preview deployment
6. Merge to `main` after review

### Commit message conventions

Use Conventional Commits format:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, no logic change
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

---

## 15. Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to https://vercel.com and sign in
3. Click **New Project → Import Git Repository**
4. Select your Nirvaya repository
5. Framework preset: **Next.js** (auto-detected)
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel production URL)
7. Click **Deploy**

### Post-deployment steps

1. Update Supabase **Site URL** to your Vercel production URL
2. Add your Vercel URL to Supabase **Redirect URLs**
3. Add your Vercel URL to Google OAuth **Authorized origins and redirects**
4. Test the full auth flow on production

### Custom domain

To add a custom domain like `nirvaya.co`:

1. In Vercel dashboard, go to your project → **Domains**
2. Add `nirvaya.co`
3. Update DNS records at your domain registrar:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. SSL is auto-provisioned by Vercel

---

## 16. Known Issues & Troubleshooting

### "Cookies() is a Promise" error

**Cause:** Next.js 15 made `cookies()` async.
**Fix:** Always use `const cookieStore = await cookies()` in server.ts and any file using cookies from next/headers.

### "Property 'auth' does not exist on type 'Promise<SupabaseClient>'"

**Cause:** Calling `createClient()` from server.ts without awaiting.
**Fix:** Use `const supabase = await createClient()` in every server component.

### "Argument of type is not assignable to parameter of type 'never'"

**Cause:** Supabase type inference breaks on upsert/update with typed Database generic.
**Fix:** Add `as any` to upsert/update arguments, e.g. `.upsert({ id, role } as any)`.

### Google OAuth "redirect_uri_mismatch"

**Cause:** The Supabase callback URL is missing from Google Cloud Console.
**Fix:** Add `https://your-project-id.supabase.co/auth/v1/callback` to **Authorized redirect URIs** in Google Cloud Console.

### "Cannot coerce the result to a single JSON object"

**Cause:** Using `.single()` on a query that returns zero rows (profile doesn't exist yet).
**Fix:** Use `.upsert()` instead of `.update()` when saving profile for the first time.

### Hydration mismatch with "cz-shortcut-listen"

**Cause:** Browser extension (ColorZilla) modifying DOM after SSR.
**Fix:** Add `suppressHydrationWarning` to the `<body>` tag in `layout.tsx`.

### Middleware deprecation warning

**Cause:** Next.js 15 renamed `middleware.ts` to `proxy.ts`.
**Fix:** Rename `src/middleware.ts` to `src/proxy.ts`. File contents stay the same.

---

## 17. Contributing

This project is currently being developed by the founding team. If you are a support developer who has been onboarded:

1. Clone the repo and set up your local environment
2. Check the GitHub Projects board for assigned tasks
3. Create a feature branch, make changes, open a PR
4. Tag Sri Harsha for code review
5. Keep PRs small and focused on one feature or fix

For questions, message Sri Harsha on WhatsApp.

---

## 18. Roadmap

### Month 1 (Current)
- [x] Landing page
- [x] Auth system (Google + email)
- [x] Role selection (6 roles)
- [x] Profile completion
- [x] User profile page
- [ ] Founders Portal (Feed, Search, Notifications)
- [ ] Mentors Portal
- [ ] Investor Portal placeholder
- [ ] Deploy to Vercel

### Month 2
- [ ] Community Feed with real-time likes
- [ ] Direct Messaging via Supabase Realtime
- [ ] Startup Listings
- [ ] Grow Unit (course upload and enrollment)
- [ ] Mentor Session Booking
- [ ] Enhanced Search with filters

### Month 3
- [ ] Full Investor Portal
- [ ] Pitch Deck upload with access control
- [ ] Admin Panel
- [ ] AP Government Scheme integration
- [ ] Transactional email system (Resend)
- [ ] Razorpay payment integration
- [ ] Telugu i18n support

### Future
- [ ] Mobile apps (iOS + Android)
- [ ] Public API for third-party integrations
- [ ] Expansion to Telangana, Tamil Nadu, Karnataka

---

## 19. License

Copyright © 2026 Nirvaya Consultancy. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this codebase is strictly prohibited. This project is not open source.

For licensing inquiries, contact hello@nirvaya.co.

---

## 20. Contact

**Nirvaya Consultancy**

- Website: https://nirvaya.co (coming soon)
- Email: hello@nirvaya.co
- Location: Vijayawada, Andhra Pradesh, India

**Founders:**

- Surendra P. — Co-Founder (Business)
- Sri Harsha M. — Tech Co-Founder

For bug reports, open a GitHub issue. For partnership or business inquiries, email hello@nirvaya.co.

---

*Built with care for Andhra Pradesh's startup ecosystem.*
