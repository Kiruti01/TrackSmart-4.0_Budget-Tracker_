import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(stats);
}

export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

async function getBalanceStats(userId: string, from: Date, to: Date) {
  // Get balance from all transactions before the current period
  const balanceBeforePeriod = await prisma.transaction.aggregate({
    where: {
      userId,
      date: {
        lt: from,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Calculate the net balance before the period (income - expenses - savings)
  const transactionsBeforePeriod = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: {
        lt: from,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const incomeBeforePeriod = transactionsBeforePeriod.find((t) => t.type === "income")?._sum.amount || 0;
  const expenseBeforePeriod = transactionsBeforePeriod.find((t) => t.type === "expense")?._sum.amount || 0;
  const savingsBeforePeriod = transactionsBeforePeriod.find((t) => t.type === "savings")?._sum.amount || 0;
  
  const totalBalanceBeforePeriod = incomeBeforePeriod - expenseBeforePeriod - savingsBeforePeriod;

  // Get current period totals
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
    income: totals.find((t) => t.type === "income")?._sum.amount || 0,
    savings: totals.find((t) => t.type === "savings")?._sum.amount || 0,
    totalBalanceBeforePeriod,
  };
}
