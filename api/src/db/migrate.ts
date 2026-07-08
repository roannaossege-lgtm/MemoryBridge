/**
 * Database migration script.
 * Creates all tables if they don't exist based on the Drizzle schema.
 * 
 * Usage: bun run db:migrate
 */
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { db } from "./connection";

const createTablesSQL = sql`
  -- Caregivers
  CREATE TABLE IF NOT EXISTS caregivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  -- Patients
  CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  -- Contacts
  CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    relationship TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL
  );

  -- Medication Reminders
  CREATE TABLE IF NOT EXISTS medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    times_of_day JSONB NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  -- Schedules
  CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  -- Location Zones (geofences)
  CREATE TABLE IF NOT EXISTS location_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL,
    notify_on_exit BOOLEAN DEFAULT true NOT NULL,
    notify_on_enter BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_patients_caregiver ON patients(caregiver_id);
  CREATE INDEX IF NOT EXISTS idx_contacts_patient ON contacts(patient_id);
  CREATE INDEX IF NOT EXISTS idx_medication_reminders_patient ON medication_reminders(patient_id);
  CREATE INDEX IF NOT EXISTS idx_schedules_patient ON schedules(patient_id);
  CREATE INDEX IF NOT EXISTS idx_location_zones_patient ON location_zones(patient_id);
`;

async function migrate() {
  console.log("Running database migration...");
  
  try {
    await db.execute(createTablesSQL);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

migrate();