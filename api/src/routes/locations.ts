/**
 * Location Zone routes: CRUD for geofences and alert settings.
 */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { locationZones, patients } from "../db/schema";
import { getCaregiverId } from "../middleware/auth";

const locationsRouter = new Hono();

const locationSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive(),
  notifyOnExit: z.boolean().optional(),
  notifyOnEnter: z.boolean().optional(),
});

async function verifyPatientAccess(patientId: string, caregiverId: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);
  return patient && patient.caregiverId === caregiverId;
}

// GET /api/locations?patientId=xxx
locationsRouter.get("/", async (c) => {
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
    .from(locationZones)
    .where(eq(locationZones.patientId, patientId))
    .orderBy(locationZones.createdAt);

  return c.json({ zones: result });
});

// POST /api/locations
locationsRouter.post("/", zValidator("json", locationSchema), async (c) => {
  const caregiverId = getCaregiverId(c);
  const data = c.req.valid("json");

  const hasAccess = await verifyPatientAccess(data.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Patient not found" }, 404);
  }

  const [zone] = await db
    .insert(locationZones)
    .values(data)
    .returning();

  return c.json({ zone }, 201);
});

// PUT /api/locations/:id
locationsRouter.put(
  "/:id",
  zValidator("json", locationSchema.partial()),
  async (c) => {
    const caregiverId = getCaregiverId(c);
    const zoneId = c.req.param("id");
    const data = c.req.valid("json");

    const [existing] = await db
      .select()
      .from(locationZones)
      .where(eq(locationZones.id, zoneId))
      .limit(1);

    if (!existing) {
      return c.json({ error: "Location zone not found" }, 404);
    }

    const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
    if (!hasAccess) {
      return c.json({ error: "Location zone not found" }, 404);
    }

    const [updated] = await db
      .update(locationZones)
      .set(data)
      .where(eq(locationZones.id, zoneId))
      .returning();

    return c.json({ zone: updated });
  }
);

// DELETE /api/locations/:id
locationsRouter.delete("/:id", async (c) => {
  const caregiverId = getCaregiverId(c);
  const zoneId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(locationZones)
    .where(eq(locationZones.id, zoneId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Location zone not found" }, 404);
  }

  const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Location zone not found" }, 404);
  }

  await db.delete(locationZones).where(eq(locationZones.id, zoneId));
  return c.json({ message: "Location zone deleted" });
});

export default locationsRouter;