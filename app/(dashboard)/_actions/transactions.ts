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

  // ✅ Use LOCAL date methods, not UTC methods
  const localDay = date.getDate(); // Local day (1-31)
  const localMonth = date.getMonth() + 1; // Local month (1-12)
  const localYear = date.getFullYear(); // Local year

  // Use Prisma transaction to do all operations atomically
  await prisma.$transaction([
    // 1️⃣ Create transaction record (keep this as is)
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date, // This should be stored as UTC date
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

    // 3️⃣ ✅ FIXED: Update monthHistory with LOCAL dates
    prisma.monthHistory.upsert({
      where: {
        userId_day_month_year: {
          userId: user.id,
          day: localDay, // ✅ Local day
          month: localMonth, // ✅ Local month
          year: localYear, // ✅ Local year
        },
      },
      create: {
        userId: user.id,
        day: localDay, // ✅ Local day
        month: localMonth, // ✅ Local month
        year: localYear, // ✅ Local year
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

    // 4️⃣ ✅ FIXED: Update yearHistory with LOCAL dates
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          month: localMonth, // ✅ Local month
          year: localYear, // ✅ Local year
          userId: user.id,
        },
      },
      create: {
        userId: user.id,
        month: localMonth, // ✅ Local month
        year: localYear, // ✅ Local year
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
