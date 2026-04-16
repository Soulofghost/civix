# 🛡️ Civix — Smart Civic Issue Reporting System

A modern, production-ready civic governance platform built for Kerala, India. Citizens can report infrastructure issues (water, roads, electricity, waste), track resolution progress in real-time, and engage with their community through a sleek, dark-mode dashboard.

## ✨ Features

- 🔐 **Authentication** — Email/Password & Google OAuth via Supabase
- 📋 **Complaint Submission** — Photo/video upload, voice input, anonymous mode
- 📍 **Live Map** — Leaflet-based complaint heatmap for your region
- 📊 **Dashboard** — Real-time stats, complaint tracking with progress timeline
- 💬 **Communication** — Real-time messaging via Socket.IO
- 🤖 **AI Chatbot** — Gemini-powered civic assistant (Malayalam/English)
- 🏆 **Leaderboard** — Karma-based citizen engagement system
- 📄 **PDF Reports** — Auto-generated complaint reports via jsPDF
- 🗺️ **Admin Dashboard** — Officials view with status management

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS |
| State | Zustand |
| Backend | Node.js, Express, Socket.IO |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Storage | Supabase Storage |
| AI | Google Gemini API |
| Maps | React Leaflet |
| Animations | Framer Motion |
| Deployment | Vercel (frontend) |

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Soulofghost/civix.git
cd civix
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your values in `.env`:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key
- `VITE_MCP_API_URL` — Your backend API URL (optional, falls back to demo mode)

### 4. Run locally
```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd server && npm run dev
```

## 🌐 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import this repo
3. Add your environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MCP_API_URL` (your deployed backend URL)
4. Deploy — Vercel auto-detects Vite ✅

> The `vercel.json` SPA rewrite rule is already configured.

## 🗄️ Supabase Setup

Run the following SQL in your Supabase SQL Editor to initialize the schema:

```sql
-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  role text default 'Citizen',
  karma integer default 0,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Complaints
create table if not exists public.complaints (
  id text primary key,
  user_id uuid references auth.users on delete set null,
  title text not null,
  description text,
  category text,
  status text default 'Submitted',
  priority text default 'Medium',
  region jsonb,
  location jsonb,
  department text,
  attachments text[],
  upvotes integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;

-- Policies
create policy "Profiles viewable by all" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Complaints viewable by all" on public.complaints for select using (true);
create policy "Auth users can submit" on public.complaints for insert with check (auth.role() = 'authenticated');
```

Also create a **public** Storage bucket named `evidence` for photo/video uploads.

## 📁 Project Structure

```
civix/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level pages
│   ├── store/          # Zustand state management
│   ├── lib/            # Supabase client
│   ├── utils/          # Helpers & API utilities
│   └── layouts/        # App shell / sidebar
├── server/             # Express + Socket.IO backend
├── public/             # Static assets
├── vercel.json         # Vercel SPA routing
└── .env.example        # Environment variable template
```

## 📜 License

MIT — Built with ❤️ by [Alvin ms](https://github.com/Soulofghost)
