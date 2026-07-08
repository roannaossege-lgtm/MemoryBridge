/**
 * Medication Reminder routes: CRUD for medication schedule.
 */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { medicationReminders, patients } from "../db/schema";
import { getCaregiverId } from "../middleware/auth";

const medicationsRouter = new Hono();

const medicationSchema = z.object({
  patientId: z.string().uuid(),
  medicationName: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  timesOfDay: z.array(z.string()).min(1),
  active: z.boolean().optional(),
});

async function verifyPatientAccess(patientId: string, caregiverId: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);
  return patient && patient.caregiverId === caregiverId;
}

// GET /api/medications?patientId=xxx
medicationsRouter.get("/", async (c) => {
  const caregiverId = getCaregiverId(c);
  const patientId = c.req.query("patientId");

  if (!patientId) {
    return c.json({ error: "patientId query parameter is required" }, 400);
  }

  const hasAccess = await verifyPatientAccess(patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Patient not found" }, 404);
  }

  const result = await db
    .select()
    .from(medicationReminders)
    .where(eq(medicationReminders.patientId, patientId))
    .orderBy(medicationReminders.createdAt);

  return c.json({ medications: result });
});

// POST /api/medications
medicationsRouter.post("/", zValidator("json", medicationSchema), async (c) => {
  const caregiverId = getCaregiverId(c);
  const data = c.req.valid("json");

  const hasAccess = await verifyPatientAccess(data.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Patient not found" }, 404);
  }

  const [medication] = await db
    .insert(medicationReminders)
    .values(data)
    .returning();

  return c.json({ medication }, 201);
});

// PUT /api/medications/:id
medicationsRouter.put(
  "/:id",
  zValidator("json", medicationSchema.partial()),
  async (c) => {
    const caregiverId = getCaregiverId(c);
    const medicationId = c.req.param("id");
    const data = c.req.valid("json");

    const [existing] = await db
      .select()
      .from(medicationReminders)
      .where(eq(medicationReminders.id, medicationId))
      .limit(1);

    if (!existing) {
      return c.json({ error: "Medication reminder not found" }, 404);
    }

    const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
    if (!hasAccess) {
      return c.json({ error: "Medication reminder not found" }, 404);
    }

    const [updated] = await db
      .update(medicationReminders)
      .set(data)
      .where(eq(medicationReminders.id, medicationId))
      .returning();

    return c.json({ medication: updated });
  }
);

// DELETE /api/medications/:id
medicationsRouter.delete("/:id", async (c) => {
  const caregiverId = getCaregiverId(c);
  const medicationId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(medicationReminders)
    .where(eq(medicationReminders.id, medicationId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Medication reminder not found" }, 404);
  }

  const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Medication reminder not found" }, 404);
  }

  await db
    .delete(medicationReminders)
    .where(eq(medicationReminders.id, medicationId));
  return c.json({ message: "Medication reminder deleted" });
});

export default medicationsRouter;