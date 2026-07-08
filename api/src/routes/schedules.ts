/**
 * Schedule routes: CRUD for daily/weekly schedule items.
 */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { schedules, patients } from "../db/schema";
import { getCaregiverId } from "../middleware/auth";

const schedulesRouter = new Hono();

const scheduleSchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().min(1).max(200),
  dayOfWeek: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  description: z.string().max(500).optional().nullable(),
});

async function verifyPatientAccess(patientId: string, caregiverId: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);
  return patient && patient.caregiverId === caregiverId;
}

// GET /api/schedules?patientId=xxx
schedulesRouter.get("/", async (c) => {
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
    .from(schedules)
    .where(eq(schedules.patientId, patientId))
    .orderBy(schedules.dayOfWeek, schedules.time);

  return c.json({ schedules: result });
});

// POST /api/schedules
schedulesRouter.post("/", zValidator("json", scheduleSchema), async (c) => {
  const caregiverId = getCaregiverId(c);
  const data = c.req.valid("json");

  const hasAccess = await verifyPatientAccess(data.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Patient not found" }, 404);
  }

  const [schedule] = await db
    .insert(schedules)
    .values(data)
    .returning();

  return c.json({ schedule }, 201);
});

// PUT /api/schedules/:id
schedulesRouter.put(
  "/:id",
  zValidator("json", scheduleSchema.partial()),
  async (c) => {
    const caregiverId = getCaregiverId(c);
    const scheduleId = c.req.param("id");
    const data = c.req.valid("json");

    const [existing] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId))
      .limit(1);

    if (!existing) {
      return c.json({ error: "Schedule item not found" }, 404);
    }

    const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
    if (!hasAccess) {
      return c.json({ error: "Schedule item not found" }, 404);
    }

    const [updated] = await db
      .update(schedules)
      .set(data)
      .where(eq(schedules.id, scheduleId))
      .returning();

    return c.json({ schedule: updated });
  }
);

// DELETE /api/schedules/:id
schedulesRouter.delete("/:id", async (c) => {
  const caregiverId = getCaregiverId(c);
  const scheduleId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, scheduleId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Schedule item not found" }, 404);
  }

  const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Schedule item not found" }, 404);
  }

  await db.delete(schedules).where(eq(schedules.id, scheduleId));
  return c.json({ message: "Schedule item deleted" });
});

export default schedulesRouter;