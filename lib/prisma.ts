import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

// Use the correct environment variable based on your .env configuration
const connectionString = process.env.DATABASE_URL || "";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create the adapter with the correct configuration
const adapter = new PrismaNeon({ connectionString });
// Initialize PrismaClient with the adapter
export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === "development") global.prisma = prisma;