import type { Context } from "hono";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

export function getCaregiverId(c: Context): string {
  const payload = c.get("jwtPayload") as JwtPayload;
  return payload.sub;
}