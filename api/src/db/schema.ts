import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Caregivers (family members who manage patients) ───
export const caregivers = pgTable("caregivers", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Patients (loved ones with memory issues) ───
export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  caregiverId: uuid("caregiver_id")
    .notNull()
    .references(() => caregivers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  timezone: text("timezone").default("UTC").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Contacts (photo-based dialing contacts) ───
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  photoUrl: text("photo_url"),
  relationship: text("relationship"),
  orderIndex: integer("order_index").default(0).notNull(),
});

// ─── Medication Reminders ───
export const medicationReminders = pgTable("medication_reminders", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  timesOfDay: jsonb("times_of_day").notNull().$type<string[]>(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Schedules (daily routine items) ───
export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // 'monday' | 'tuesday' | ... | 'daily'
  time: text("time").notNull(), // HH:mm format
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Location Zones (geofences) ───
export const locationZones = pgTable("location_zones", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  radiusMeters: integer("radius_meters").notNull(),
  notifyOnExit: boolean("notify_on_exit").default(true).notNull(),
  notifyOnEnter: boolean("notify_on_enter").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});