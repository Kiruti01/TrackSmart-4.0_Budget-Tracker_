"use server";

import prisma from "@/lib/prisma";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  // Validate form data
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { amount, category, date, description, type } = parsedBody.data;

  // Fetch category info
  const categoryRow = await prisma.category.findFirst({
    where: { userId: user.id, name: category },
  });
  if (!categoryRow) throw new Error("Category not found");

  // Use Prisma transaction to do all operations atomically
  await prisma.$transaction([
    // 1️⃣ Create transaction record
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date,
        description: description || "",
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),

    // 2️⃣ Update cumulative savings if this is a savings transaction
    ...(type === "savings"
      ? [
          prisma.cumulativeSavings.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              totalSavings: amount,
            },
            update: {
              totalSavings: { increment: amount },
              updatedAt: new Date(), // uses schema field
            },
          }),
        ]
      : []),

    // 3️⃣ Update monthHistory
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth() + 1, // Prisma months usually 1-12
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        income: type === "income" ? amount : 0,
        expense: type === "expense" ? amount : 0,
        savings: type === "savings" ? amount : 0,
      },
      update: {
        income: { increment: type === "income" ? amount : 0 },
        expense: { increment: type === "expense" ? amount : 0 },
        savings: { increment: type === "savings" ? amount : 0 },
      },
    }),

    // 4️⃣ Update yearHistory
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth() + 1,
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        income: type === "income" ? amount : 0,
        expense: type === "expense" ? amount : 0,
        savings: type === "savings" ? amount : 0,
      },
      update: {
        income: { increment: type === "income" ? amount : 0 },
        expense: { increment: type === "expense" ? amount : 0 },
        savings: { increment: type === "savings" ? amount : 0 },
      },
    }),
  ]);
}
