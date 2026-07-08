/**
 * Auth routes: caregiver registration and login.
 */
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/connection";
import { caregivers } from "../db/schema";

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// POST /api/auth/register
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const { email, password, name } = c.req.valid("json");

    // Check if caregiver already exists
    const existing = await db
      .select()
      .from(caregivers)
      .where(eq(caregivers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "A caregiver with this email already exists" }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create caregiver
    const [caregiver] = await db
      .insert(caregivers)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
      })
      .returning({
        id: caregivers.id,
        email: caregivers.email,
        name: caregivers.name,
        createdAt: caregivers.createdAt,
      });

    // Generate JWT
    const token = jwt.sign(
      { sub: caregiver.id, email: caregiver.email, role: "caregiver" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({ caregiver, token }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// POST /api/auth/login
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid("json");

    // Find caregiver
    const [caregiver] = await db
      .select()
      .from(caregivers)
      .where(eq(caregivers.email, email.toLowerCase()))
      .limit(1);

    if (!caregiver) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, caregiver.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { sub: caregiver.id, email: caregiver.email, role: "caregiver" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return c.json({
      caregiver: {
        id: caregiver.id,
        email: caregiver.email,
        name: caregiver.name,
        createdAt: caregiver.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

export default auth;