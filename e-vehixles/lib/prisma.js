// lib/prisma.js

import { PrismaClient } from '@/lib/generated/prisma';


const globalForPrisma = globalThis;

// Prevent creating new client instances on every hot reload in dev
export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
