"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteAllTransactions() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  await prisma.$transaction([
    // Delete all transactions for the user
    prisma.transaction.deleteMany({
      where: {
        userId: user.id,
      },
    }),

    // Reset cumulative savings
    prisma.cumulativeSavings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalSavings: 0,
      },
      update: {
        totalSavings: 0,
        updatedAt: new Date(),
      },
    }),

    // Delete all month history
    prisma.monthHistory.deleteMany({
      where: {
        userId: user.id,
      },
    }),

    // Delete all year history
    prisma.yearHistory.deleteMany({
      where: {
        userId: user.id,
      },
    }),
  ]);
}
