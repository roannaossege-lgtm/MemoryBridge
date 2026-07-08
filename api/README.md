# MemoryBridge API

Backend API server for MemoryBridge — a smartphone app helping people with memory issues stay oriented, safe, and connected to loved ones.

## Tech Stack

- **Runtime:** Node.js 22+
- **Framework:** Hono (lightweight HTTP server)
- **Language:** TypeScript
- **Database:** PostgreSQL via Neon (serverless)
- **ORM:** Drizzle ORM
- **Auth:** JWT (HS256) with bcrypt password hashing

## Project Structure

```
memorybridge-api/
├── src/
│   ├── index.ts          # Main app entry, middleware, route mounting
│   ├── db/
│   │   ├── index.ts      # Re-exports
│   │   ├── connection.ts # Neon Postgres connection via Drizzle
│   │   ├── schema.ts     # Drizzle schema (all tables)
│   │   └── migrate.ts    # Migration script (run to create tables)
│   ├── routes/
│   │   ├── auth.ts       # POST /api/auth/register, /api/auth/login
│   │   ├── patients.ts   # CRUD /api/patients
│   │   ├── contacts.ts   # CRUD /api/contacts
│   │   ├── medications.ts # CRUD /api/medications
│   │   ├── schedules.ts   # CRUD /api/schedules
│   │   └── locations.ts   # CRUD /api/locations
│   └── middleware/
│       └── auth.ts       # JWT payload type helpers
└── migrations/           # Raw SQL migration scripts
```

## Database Schema

| Table | Description |
|-------|-------------|
| `caregivers` | Family members who manage patients (email, password_hash, name) |
| `patients` | Loved ones with memory issues (linked to caregiver) |
| `contacts` | Photo-based dialing contacts for patients |
| `medication_reminders` | Medication schedules with times of day |
| `schedules` | Daily/weekly routine items |
| `location_zones` | Geofence areas with enter/exit notifications |

## Getting Started

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL (Neon Postgres)
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run database migration:**
   ```bash
   npm run db:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Public
- `GET /api/health` — Health check
- `POST /api/auth/register` — Register a new caregiver
- `POST /api/auth/login` — Login (returns JWT)

### Protected (JWT required in Authorization header)
- `GET|POST|PUT|DELETE /api/patients` — Patient management
- `GET|POST|PUT|DELETE /api/contacts?patientId=X` — Contact management
- `GET|POST|PUT|DELETE /api/medications?patientId=X` — Medication reminders
- `GET|POST|PUT|DELETE /api/schedules?patientId=X` — Daily schedules
- `GET|POST|PUT|DELETE /api/locations?patientId=X` — Location zones