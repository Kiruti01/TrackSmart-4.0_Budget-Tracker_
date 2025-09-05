import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Production: use DATABASE_URL (Session Pooler)
  prisma = new PrismaClient();
} else {
  // Local development: use direct connection
  prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL }, // make sure this points to the direct connection
    },
  });
}

// For hot-reloading in dev (Next.js)
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;
