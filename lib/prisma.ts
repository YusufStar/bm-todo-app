import { PrismaClient } from "@/generated/prisma";

declare global {
    var prisma: PrismaClient | undefined;
}

globalThis.prisma = globalThis.prisma || new PrismaClient();

export const prisma = globalThis.prisma;
