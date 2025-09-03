import prisma from "@/lib/prisma";
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

  if (!from || !to) {
    return Response.json({ error: "Missing date parameters" }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Get cumulative savings up to the start of the period
  const cumulativeSavings = await getCumulativeSavings(user.id);
  
  // Get current period savings
  const currentPeriodSavings = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      type: "savings",
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Get savings before the current period
  const savingsBeforePeriod = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      type: "savings",
      date: {
        lt: fromDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return Response.json({
    totalCumulativeSavings: cumulativeSavings.totalSavings,
    currentPeriodSavings: currentPeriodSavings._sum.amount || 0,
    savingsBeforePeriod: savingsBeforePeriod._sum.amount || 0,
  });
}

export type GetCumulativeSavingsResponseType = Awaited<
  ReturnType<typeof getCumulativeSavings>
>;

async function getCumulativeSavings(userId: string) {
  // Get or create cumulative savings record
  let cumulativeSavings = await prisma.cumulativeSavings.findUnique({
    where: { userId },
  });

  if (!cumulativeSavings) {
    // Calculate total savings from all transactions
    const totalSavings = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "savings",
      },
      _sum: {
        amount: true,
      },
    });

    // Create the record
    cumulativeSavings = await prisma.cumulativeSavings.create({
      data: {
        userId,
        totalSavings: totalSavings._sum.amount || 0,
      },
    });
  }

  return cumulativeSavings;
}