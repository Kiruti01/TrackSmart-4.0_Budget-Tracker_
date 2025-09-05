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
    // console.error("Query params validation failed:", queryParams.error);
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  // console.log("Balance stats result:", stats);
  return Response.json(stats);
}

export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

// Define the type for grouped transactions
type GroupedTransaction = {
  type: string;
  _sum: {
    amount: number | null;
  };
};

async function getBalanceStats(userId: string, from: Date, to: Date) {
  // console.log(
  //   "Getting balance stats for user:",
  //   userId,
  //   "from:",
  //   from,
  //   "to:",
  //   to
  // );

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

  const incomeBeforePeriod =
    transactionsBeforePeriod.find(
      (t: GroupedTransaction) => t.type === "income"
    )?._sum.amount || 0;
  const expenseBeforePeriod =
    transactionsBeforePeriod.find(
      (t: GroupedTransaction) => t.type === "expense"
    )?._sum.amount || 0;
  const savingsBeforePeriod =
    transactionsBeforePeriod.find(
      (t: GroupedTransaction) => t.type === "savings"
    )?._sum.amount || 0;

  const totalBalanceBeforePeriod =
    incomeBeforePeriod - expenseBeforePeriod - savingsBeforePeriod;

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

  // console.log("Current period totals:", totals);

  // Add more detailed debugging
  // console.log("Date range query:", {
  //   userId,
  //   from: from.toISOString(),
  //   to: to.toISOString(),
  // });

  // Debug: Check if any transactions exist in the date range
  const allTransactionsInRange = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    select: {
      id: true,
      type: true,
      amount: true,
      date: true,
      description: true,
    },
  });

  // console.log("All transactions in date range:", allTransactionsInRange);
  // console.log(
  //   "Income transactions in range:",
  //   allTransactionsInRange.filter((t: { type: string }) => t.type === "income")
  // );

  const result = {
    expense:
      totals.find((t: GroupedTransaction) => t.type === "expense")?._sum
        .amount || 0,
    income:
      totals.find((t: GroupedTransaction) => t.type === "income")?._sum
        .amount || 0,
    savings:
      totals.find((t: GroupedTransaction) => t.type === "savings")?._sum
        .amount || 0,
    totalBalanceBeforePeriod,
  };

  // console.log("Final balance stats result:", result);
  return result;
}
