"use server";

import prisma from "@/lib/prisma";
import { CreateTransactionSchema } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Define a schema for updating a transaction, including the ID
const UpdateTransactionSchema = CreateTransactionSchema.extend({
  id: z.string().min(1), // Transaction ID is required for updates
});

export type UpdateTransactionSchemaType = z.infer<
  typeof UpdateTransactionSchema
>;

export async function UpdateTransaction(form: UpdateTransactionSchemaType) {
  // Validate form data
  const parsedBody = UpdateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id, amount, category, date, description, type } = parsedBody.data;

  // Fetch the original transaction to compare changes
  const originalTransaction = await prisma.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!originalTransaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  // Fetch category info for the new category
  const newCategoryRow = await prisma.category.findFirst({
    where: { userId: user.id, name: category },
  });
  if (!newCategoryRow) throw new Error("New category not found");

  // Calculate local date components for history updates
  const newLocalDay = date.getDate();
  const newLocalMonth = date.getMonth() + 1;
  const newLocalYear = date.getFullYear();

  const originalLocalDay = originalTransaction.date.getDate();
  const originalLocalMonth = originalTransaction.date.getMonth() + 1;
  const originalLocalYear = originalTransaction.date.getFullYear();

  await prisma.$transaction(async (tx) => {
    // 1. Revert impact of original transaction on history tables
    // Only revert if the date or type has changed, or if the amount has changed
    if (
      originalLocalDay !== newLocalDay ||
      originalLocalMonth !== newLocalMonth ||
      originalLocalYear !== newLocalYear ||
      originalTransaction.type !== type ||
      originalTransaction.amount !== amount
    ) {
      // Decrement original values from original month history
      await tx.monthHistory.upsert({
        where: {
          userId_day_month_year: {
            userId: user.id,
            day: originalLocalDay,
            month: originalLocalMonth,
            year: originalLocalYear,
          },
        },
        create: {
          userId: user.id,
          day: originalLocalDay,
          month: originalLocalMonth,
          year: originalLocalYear,
          income: originalTransaction.type === "income" ? -originalTransaction.amount : 0,
          expense: originalTransaction.type === "expense" ? -originalTransaction.amount : 0,
          savings: originalTransaction.type === "savings" ? -originalTransaction.amount : 0,
        },
        update: {
          income: { decrement: originalTransaction.type === "income" ? originalTransaction.amount : 0 },
          expense: { decrement: originalTransaction.type === "expense" ? originalTransaction.amount : 0 },
          savings: { decrement: originalTransaction.type === "savings" ? originalTransaction.amount : 0 },
        },
      });

      // Decrement original values from original year history
      await tx.yearHistory.upsert({
        where: {
          month_year_userId: {
            userId: user.id,
            month: originalLocalMonth,
            year: originalLocalYear,
          },
        },
        create: {
          userId: user.id,
          month: originalLocalMonth,
          year: originalLocalYear,
          income: originalTransaction.type === "income" ? -originalTransaction.amount : 0,
          expense: originalTransaction.type === "expense" ? -originalTransaction.amount : 0,
          savings: originalTransaction.type === "savings" ? -originalTransaction.amount : 0,
        },
        update: {
          income: { decrement: originalTransaction.type === "income" ? originalTransaction.amount : 0 },
          expense: { decrement: originalTransaction.type === "expense" ? originalTransaction.amount : 0 },
          savings: { decrement: originalTransaction.type === "savings" ? originalTransaction.amount : 0 },
        },
      });

      // Adjust cumulative savings if original was a savings transaction
      if (originalTransaction.type === "savings") {
        await tx.cumulativeSavings.update({
          where: { userId: user.id },
          data: { totalSavings: { decrement: originalTransaction.amount } },
        });
      }
    }

    // 2. Update the transaction record
    await tx.transaction.update({
      where: { id, userId: user.id },
      data: {
        amount,
        date,
        description: description || "",
        type,
        category: newCategoryRow.name,
        categoryIcon: newCategoryRow.icon,
      },
    });

    // 3. Apply impact of new/updated transaction on history tables
    // This logic is similar to CreateTransaction, but for the new values
    await tx.monthHistory.upsert({
      where: {
        userId_day_month_year: {
          userId: user.id,
          day: newLocalDay,
          month: newLocalMonth,
          year: newLocalYear,
        },
      },
      create: {
        userId: user.id,
        day: newLocalDay,
        month: newLocalMonth,
        year: newLocalYear,
        income: type === "income" ? amount : 0,
        expense: type === "expense" ? amount : 0,
        savings: type === "savings" ? amount : 0,
      },
      update: {
        income: { increment: type === "income" ? amount : 0 },
        expense: { increment: type === "expense" ? amount : 0 },
        savings: { increment: type === "savings" ? amount : 0 },
      },
    });

    await tx.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: newLocalMonth,
          year: newLocalYear,
        },
      },
      create: {
        userId: user.id,
        month: newLocalMonth,
        year: newLocalYear,
        income: type === "income" ? amount : 0,
        expense: type === "expense" ? amount : 0,
        savings: type === "savings" ? amount : 0,
      },
      update: {
        income: { increment: type === "income" ? amount : 0 },
        expense: { increment: type === "expense" ? amount : 0 },
        savings: { increment: type === "savings" ? amount : 0 },
      },
    });

    // Adjust cumulative savings if new transaction is a savings type
    if (type === "savings") {
      await tx.cumulativeSavings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalSavings: amount,
        },
        update: {
          totalSavings: { increment: amount },
        },
      });
    }
  });
}