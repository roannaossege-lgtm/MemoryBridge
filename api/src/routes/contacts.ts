/**
 * Contacts routes: photo-based dialing contacts for patients.
 */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { contacts, patients } from "../db/schema";
import { getCaregiverId } from "../middleware/auth";

const contactsRouter = new Hono();

const contactSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().min(1).max(100),
  phone: z.string().min(1),
  photoUrl: z.string().url().optional().nullable(),
  relationship: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().optional(),
});

// Helper: verify caregiver owns the patient
async function verifyPatientAccess(patientId: string, caregiverId: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);
  return patient && patient.caregiverId === caregiverId;
}

// GET /api/contacts?patientId=xxx — list contacts for a patient
contactsRouter.get("/", async (c) => {
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
    .from(contacts)
    .where(eq(contacts.patientId, patientId))
    .orderBy(contacts.orderIndex);

  return c.json({ contacts: result });
});

// POST /api/contacts — add a contact
contactsRouter.post("/", zValidator("json", contactSchema), async (c) => {
  const caregiverId = getCaregiverId(c);
  const data = c.req.valid("json");

  const hasAccess = await verifyPatientAccess(data.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Patient not found" }, 404);
  }

  const [contact] = await db
    .insert(contacts)
    .values(data)
    .returning();

  return c.json({ contact }, 201);
});

// PUT /api/contacts/:id — update a contact
contactsRouter.put(
  "/:id",
  zValidator("json", contactSchema.partial()),
  async (c) => {
    const caregiverId = getCaregiverId(c);
    const contactId = c.req.param("id");
    const data = c.req.valid("json");

    const [existing] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    if (!existing) {
      return c.json({ error: "Contact not found" }, 404);
    }

    const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
    if (!hasAccess) {
      return c.json({ error: "Contact not found" }, 404);
    }

    const [updated] = await db
      .update(contacts)
      .set(data)
      .where(eq(contacts.id, contactId))
      .returning();

    return c.json({ contact: updated });
  }
);

// DELETE /api/contacts/:id — delete a contact
contactsRouter.delete("/:id", async (c) => {
  const caregiverId = getCaregiverId(c);
  const contactId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Contact not found" }, 404);
  }

  const hasAccess = await verifyPatientAccess(existing.patientId, caregiverId);
  if (!hasAccess) {
    return c.json({ error: "Contact not found" }, 404);
  }

  await db.delete(contacts).where(eq(contacts.id, contactId));
  return c.json({ message: "Contact deleted" });
});

export default contactsRouter;