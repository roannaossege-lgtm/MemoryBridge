import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patients";
import contactRoutes from "./routes/contacts";
import medicationRoutes from "./routes/medications";
import scheduleRoutes from "./routes/schedules";
import locationRoutes from "./routes/locations";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Health check
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    service: "memorybridge-api",
    timestamp: new Date().toISOString(),
  })
);

// Public routes (no auth required)
app.route("/api/auth", authRoutes);

// JWT config
const jwtConfig = {
  secret: process.env.JWT_SECRET || "dev-secret-change-me",
  alg: "HS256" as const,
};

// Protected routes (JWT required)
app.use("/api/patients/*", jwt(jwtConfig));
app.use("/api/contacts/*", jwt(jwtConfig));
app.use("/api/medications/*", jwt(jwtConfig));
app.use("/api/schedules/*", jwt(jwtConfig));
app.use("/api/locations/*", jwt(jwtConfig));

// Protected resource routes
app.route("/api/patients", patientRoutes);
app.route("/api/contacts", contactRoutes);
app.route("/api/medications", medicationRoutes);
app.route("/api/schedules", scheduleRoutes);
app.route("/api/locations", locationRoutes);

export default app;