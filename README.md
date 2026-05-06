# Cevvy - An advanced CV generator

## Overview
An application that generates a tailored CV and cover letter using an agentic AI workflow. Users create a **workspace** per job application, paste their existing CV and a job description, and Claude generates polished, role-specific documents that can be copied or downloaded.

## Tech stack
- Next.js 14 (App Router) + TypeScript
- Prisma ORM + SQLite
- NextAuth.js (credentials)
- Anthropic Claude API (streaming)
- Tailwind CSS

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Any long random string (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `ANTHROPIC_API_KEY` | Your key from [console.anthropic.com](https://console.anthropic.com) |
| `DATABASE_URL` | Leave as `file:./dev.db` for local SQLite |

### 3. Set up the database
```bash
npx prisma db push
```

### 4. Run the development server
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

1. Register an account and log in
2. Click **New Workspace** from the dashboard
3. In the workspace studio:
   - Paste your existing CV
   - Paste the job description
   - Click **Generate CV** and/or **Generate Cover Letter**
4. Edit, copy, or download the generated documents as `.md`

## Input formats supported
- Existing CV: paste as plain text (`.docx`, `.pdf`, `.json`, `.md`, `.yaml`)
- Job description: paste as plain text

## Database
[Schema diagram](database/diagram.md) · [Table definitions](database/tables.md)
