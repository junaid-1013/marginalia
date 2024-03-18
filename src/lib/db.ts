import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}
// This setup ensures that the Prisma client remains alive between Next.js hot reloads,
// preventing reinitialization on every request. It creates a new instance of the Prisma
// client on each reload, unless an existing global instance is available.
// Global scope ensures persistence across reloads, unaffected by hot reloads.
// In production, it creates the client only once.

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
