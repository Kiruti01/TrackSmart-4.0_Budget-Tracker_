"use server";

import prisma from "@/lib/prisma";
import { UpdateUserCurrencySchema } from "@/schema/userSettings";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { convertCurrencyHistorical } from "@/lib/exchangeRates";

export async function UpdateUserCurrency(currency: string) {
  const parsedBody = UpdateUserCurrencySchema.safeParse({ currency });
  if (!parsedBody.success) throw parsedBody.error;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  try {
    // Get current user settings to check if currency is actually changing
    const currentSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // If currency is the same, no need to do anything
    if (currentSettings?.currency === currency) {
      return currentSettings;
    }

    console.log(`Converting user ${user.id} from ${currentSettings?.currency} to ${currency}`);

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    });

    console.log(`Found ${transactions.length} transactions to convert`);

    // Convert all transactions to the new currency
    const convertedTransactions = [];
    for (const transaction of transactions) {
      try {
        // Use original currency if available, otherwise fall back to current user currency
        const fromCurrency = transaction.originalCurrency || currentSettings?.currency || 'USD';
        
        // Convert using historical rate for the transaction date
        const convertedAmount = await convertCurrencyHistorical(
          transaction.originalAmount || transaction.amount,
          fromCurrency,
          currency,
          transaction.date
        );

        convertedTransactions.push({
          id: transaction.id,
          newAmount: convertedAmount,
          originalAmount: transaction.originalAmount || transaction.amount,
          originalCurrency: transaction.originalCurrency || fromCurrency,
        });
      } catch (error) {
        console.error(`Failed to convert transaction ${transaction.id}:`, error);
        // Keep original amount if conversion fails
        convertedTransactions.push({
          id: transaction.id,
          newAmount: transaction.amount,
          originalAmount: transaction.originalAmount || transaction.amount,
          originalCurrency: transaction.originalCurrency || currentSettings?.currency || 'USD',
        });
      }
    }

    // Perform all updates in a single transaction
    await prisma.$transaction(async (tx) => {
      // Update user settings
      const userSettings = await tx.userSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          currency,
        },
        update: {
          currency,
        },
      });

      // Update all transaction amounts
      for (const converted of convertedTransactions) {
        await tx.transaction.update({
          where: { id: converted.id },
          data: {
            amount: converted.newAmount,
            originalAmount: converted.originalAmount,
            originalCurrency: converted.originalCurrency,
          },
        });
      }

      // Clear and rebuild history tables
      console.log('Clearing history tables...');
      
      // Delete existing history
      await tx.monthHistory.deleteMany({
        where: { userId: user.id },
      });
      
      await tx.yearHistory.deleteMany({
        where: { userId: user.id },
      });
      
      await tx.cumulativeSavings.deleteMany({
        where: { userId: user.id },
      });

      console.log('Rebuilding history tables...');

      // Rebuild history from converted transactions
      const updatedTransactions = await tx.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: 'asc' },
      });

      // Group transactions by month and year for efficient updates
      const monthlyData = new Map<string, { income: number; expense: number; savings: number }>();
      const yearlyData = new Map<string, { income: number; expense: number; savings: number }>();
      let totalSavings = 0;

      for (const transaction of updatedTransactions) {
        const localDay = transaction.date.getDate();
        const localMonth = transaction.date.getMonth() + 1;
        const localYear = transaction.date.getFullYear();

        // Monthly aggregation
        const monthKey = `${user.id}-${localDay}-${localMonth}-${localYear}`;
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { income: 0, expense: 0, savings: 0 });
        }
        const monthData = monthlyData.get(monthKey)!;
        
        // Yearly aggregation
        const yearKey = `${user.id}-${localMonth}-${localYear}`;
        if (!yearlyData.has(yearKey)) {
          yearlyData.set(yearKey, { income: 0, expense: 0, savings: 0 });
        }
        const yearData = yearlyData.get(yearKey)!;

        // Add to appropriate totals
        if (transaction.type === 'income') {
          monthData.income += transaction.amount;
          yearData.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthData.expense += transaction.amount;
          yearData.expense += transaction.amount;
        } else if (transaction.type === 'savings') {
          monthData.savings += transaction.amount;
          yearData.savings += transaction.amount;
          totalSavings += transaction.amount;
        }
      }

      // Insert monthly history
      for (const [key, data] of monthlyData) {
        const [userId, day, month, year] = key.split('-');
        await tx.monthHistory.create({
          data: {
            userId,
            day: parseInt(day),
            month: parseInt(month),
            year: parseInt(year),
            income: data.income,
            expense: data.expense,
            savings: data.savings,
          },
        });
      }

      // Insert yearly history
      for (const [key, data] of yearlyData) {
        const [userId, month, year] = key.split('-');
        await tx.yearHistory.create({
          data: {
            userId,
            month: parseInt(month),
            year: parseInt(year),
            income: data.income,
            expense: data.expense,
            savings: data.savings,
          },
        });
      }

      // Insert cumulative savings
      if (totalSavings > 0) {
        await tx.cumulativeSavings.create({
          data: {
            userId: user.id,
            totalSavings,
          },
        });
      }

      console.log(`Currency conversion completed. Total savings: ${totalSavings}`);
      return userSettings;
    });
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
