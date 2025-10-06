import prisma from "@/lib/prisma";
import { convertCurrency, getCurrentExchangeRate } from "./exchangeRates";

export async function convertTransactionAmountsToNewCurrency(
  userId: string,
  newCurrency: string
): Promise<void> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: {
      id: true,
      originalAmount: true,
      originalCurrency: true,
    },
  });

  const updates = await Promise.all(
    transactions.map(async (transaction) => {
      if (transaction.originalCurrency === newCurrency) {
        return { id: transaction.id, newAmount: transaction.originalAmount };
      }

      const convertedAmount = await convertCurrency(
        transaction.originalAmount,
        transaction.originalCurrency,
        newCurrency
      );

      return { id: transaction.id, newAmount: convertedAmount };
    })
  );

  await prisma.$transaction(
    updates.map((update) =>
      prisma.transaction.update({
        where: { id: update.id },
        data: { amount: update.newAmount },
      })
    )
  );
}

export async function recalculateHistoryForNewCurrency(
  userId: string
): Promise<void> {
  await prisma.monthHistory.deleteMany({ where: { userId } });
  await prisma.yearHistory.deleteMany({ where: { userId } });

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  for (const transaction of transactions) {
    const localDay = transaction.date.getDate();
    const localMonth = transaction.date.getMonth() + 1;
    const localYear = transaction.date.getFullYear();

    await prisma.monthHistory.upsert({
      where: {
        userId_day_month_year: {
          userId,
          day: localDay,
          month: localMonth,
          year: localYear,
        },
      },
      create: {
        userId,
        day: localDay,
        month: localMonth,
        year: localYear,
        income: transaction.type === "income" ? transaction.amount : 0,
        expense: transaction.type === "expense" ? transaction.amount : 0,
        savings: transaction.type === "savings" ? transaction.amount : 0,
      },
      update: {
        income: {
          increment: transaction.type === "income" ? transaction.amount : 0,
        },
        expense: {
          increment: transaction.type === "expense" ? transaction.amount : 0,
        },
        savings: {
          increment: transaction.type === "savings" ? transaction.amount : 0,
        },
      },
    });

    await prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId,
          month: localMonth,
          year: localYear,
        },
      },
      create: {
        userId,
        month: localMonth,
        year: localYear,
        income: transaction.type === "income" ? transaction.amount : 0,
        expense: transaction.type === "expense" ? transaction.amount : 0,
        savings: transaction.type === "savings" ? transaction.amount : 0,
      },
      update: {
        income: {
          increment: transaction.type === "income" ? transaction.amount : 0,
        },
        expense: {
          increment: transaction.type === "expense" ? transaction.amount : 0,
        },
        savings: {
          increment: transaction.type === "savings" ? transaction.amount : 0,
        },
      },
    });
  }

  const totalSavings = await prisma.transaction.aggregate({
    where: { userId, type: "savings" },
    _sum: { amount: true },
  });

  await prisma.cumulativeSavings.upsert({
    where: { userId },
    create: {
      userId,
      totalSavings: totalSavings._sum.amount || 0,
    },
    update: {
      totalSavings: totalSavings._sum.amount || 0,
    },
  });
}
