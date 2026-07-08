# MemoryBridge

A simple smartphone app that helps people with memory issues stay oriented, safe, and connected to loved ones. Features include medication reminders, daily schedules, photo-based contact dialing, location alerts, and a simplified interface.

## Repository Structure

```
MemoryBridge/
├── api/          # Backend API server (Hono + TypeScript + Neon Postgres)
├── web/          # Caregiver web dashboard (TanStack Start + React + Tailwind)
└── README.md
```

## Projects

### `api/` — Backend API

REST API built with Hono, TypeScript, Drizzle ORM, and Neon Postgres.

- **Auth:** JWT (HS256) with bcrypt password hashing
- **Tables:** caregivers, patients, contacts, medication_reminders, schedules, location_zones
- **Endpoints:** Full CRUD for all resources, protected by JWT

See `api/README.md` for details.

### `web/` — Caregiver Dashboard

Web dashboard for family members to manage patient schedules, contacts, reminders, and location zones. Built with TanStack Start (React + Vite + Tailwind CSS).

## Getting Started

1. Clone the repo
2. Set up the backend: `cd api && npm install && cp .env.example .env` (fill in DATABASE_URL)
3. Run migrations: `npm run db:migrate`
4. Start the API: `npm run dev`
5. In another terminal, start the dashboard: `cd ../web && bun install && bun run publish`