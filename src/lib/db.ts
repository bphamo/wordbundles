import { PrismaClient } from "@/generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const db: PrismaClient = global.__prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = db;
}
