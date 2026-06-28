# EduMatch Backend

FastAPI backend for the EduMatch frontend.

## Run locally

```powershell
cd outputs\edumatch\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

If port 8000 is busy, use the included launcher instead. It picks the first
available port from 8000-8010 and updates the frontend API target:

```powershell
python run_backend.py
```

Then run the frontend with:

```powershell
cd outputs\edumatch
npm run dev
```

## Environment

Set `OPENROUTER_API_KEY` to enable real AI mentor answers and AI college analysis.
Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to persist users, profiles, chats, searches, and match requests.
Set `MYSQL_DSN` only if you also want a MySQL audit mirror.

## Supabase tables

Create these tables in Supabase if you want full persistence:

```sql
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  career text,
  profile jsonb not null,
  created_at timestamptz default now()
);

create table if not exists match_requests (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  career text,
  profile jsonb not null,
  response jsonb not null,
  created_at timestamptz default now()
);

create table if not exists mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  session_id text,
  role text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists college_searches (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  query text,
  filters jsonb default '{}'::jsonb,
  response jsonb not null,
  created_at timestamptz default now()
);
```
