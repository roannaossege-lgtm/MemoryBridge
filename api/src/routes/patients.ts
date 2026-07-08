/**
 * Patient routes: CRUD for patients linked to a caregiver.
 */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { patients } from "../db/schema";
import { getCaregiverId } from "../middleware/auth";

const patientsRouter = new Hono();

const patientSchema = z.object({
  name: z.string().min(1).max(100),
  photoUrl: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
});

// GET /api/patients — list all patients for the authenticated caregiver
patientsRouter.get("/", async (c) => {
  const caregiverId = getCaregiverId(c);

  const result = await db
    .select()
    .from(patients)
    .where(eq(patients.caregiverId, caregiverId))
    .orderBy(patients.createdAt);

  return c.json({ patients: result });
});

// GET /api/patients/:id — get a single patient
patientsRouter.get("/:id", async (c) => {
  const caregiverId = getCaregiverId(c);
  const patientId = c.req.param("id");

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);

  if (!patient || patient.caregiverId !== caregiverId) {
    return c.json({ error: "Patient not found" }, 404);
  }

  return c.json({ patient });
});

// POST /api/patients — create a new patient
patientsRouter.post("/", zValidator("json", patientSchema), async (c) => {
  const caregiverId = getCaregiverId(c);
  const data = c.req.valid("json");

  const [patient] = await db
    .insert(patients)
    .values({
      caregiverId,
      name: data.name,
      photoUrl: data.photoUrl || null,
      timezone: data.timezone || "UTC",
    })
    .returning();

  return c.json({ patient }, 201);
});

// PUT /api/patients/:id — update a patient
patientsRouter.put(
  "/:id",
  zValidator("json", patientSchema.partial()),
  async (c) => {
    const caregiverId = getCaregiverId(c);
    const patientId = c.req.param("id");
    const data = c.req.valid("json");

    // Verify ownership
    const [existing] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!existing || existing.caregiverId !== caregiverId) {
      return c.json({ error: "Patient not found" }, 404);
    }

    const [updated] = await db
      .update(patients)
      .set(data)
      .where(eq(patients.id, patientId))
      .returning();

    return c.json({ patient: updated });
  }
);

// DELETE /api/patients/:id — delete a patient
patientsRouter.delete("/:id", async (c) => {
  const caregiverId = getCaregiverId(c);
  const patientId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);

  if (!existing || existing.caregiverId !== caregiverId) {
    return c.json({ error: "Patient not found" }, 404);
  }

  await db.delete(patients).where(eq(patients.id, patientId));
  return c.json({ message: "Patient deleted" });
});

export default patientsRouter;