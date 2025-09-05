"use server";

import prisma from "@/lib/prisma";
import { UpdateUserCurrencySchema } from "@/schema/userSettings";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function UpdateUserCurrency(currency: string) {
  const parsedBody = UpdateUserCurrencySchema.safeParse({ currency });
  if (!parsedBody.success) throw parsedBody.error;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  try {
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        currency,
      },
      update: {
        currency,
      },
    });

    return userSettings;
  } catch (err) {
    console.error("Prisma upsert error:", err);
    throw new Error("Could not update user settings. Please try again later.");
  }
}
