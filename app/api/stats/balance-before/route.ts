import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const getBalanceBeforeSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(3000),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const queryParams = getBalanceBeforeSchema.safeParse({
    timeframe,
    month,
    year,
  });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const { timeframe: tf, year: y, month: m } = queryParams.data;
  
  // Calculate the date before which we want to get the balance
  let beforeDate: Date;
  if (tf === "year") {
    beforeDate = new Date(y, 0, 1); // January 1st of the selected year
  } else {
    beforeDate = new Date(y, m, 1); // 1st day of the selected month
  }

  // Get all transactions before the specified period
  const transactionsBeforePeriod = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId: user.id,
      date: {
        lt: beforeDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const incomeBeforePeriod = transactionsBeforePeriod.find((t) => t.type === "income")?._sum.amount || 0;
  const expenseBeforePeriod = transactionsBeforePeriod.find((t) => t.type === "expense")?._sum.amount || 0;
  const savingsBeforePeriod = transactionsBeforePeriod.find((t) => t.type === "savings")?._sum.amount || 0;
  
  const balanceBeforePeriod = incomeBeforePeriod - expenseBeforePeriod - savingsBeforePeriod;

  return Response.json({
    balanceBeforePeriod,
    savingsBeforePeriod,
  });
}