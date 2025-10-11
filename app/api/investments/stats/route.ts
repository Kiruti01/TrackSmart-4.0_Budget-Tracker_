import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(from) : startOfMonth(new Date());
  const toDate = to ? new Date(to) : endOfMonth(new Date());

  const investments = await prisma.investment.findMany({
    where: {
      userId: user.id,
    },
  });

  const totalCurrentValueKes =
    investments.reduce((sum, inv) => sum + inv.currentValueKes, 0) || 0;

  const totalInitialAmountKes =
    investments.reduce((sum, inv) => sum + inv.initialAmountKes, 0) || 0;

  const totalGainKes = totalCurrentValueKes - totalInitialAmountKes;
  const totalGainPercentage =
    totalInitialAmountKes > 0
      ? (totalGainKes / totalInitialAmountKes) * 100
      : 0;

  const investedThisMonth =
    investments
      .filter((inv) => {
        const dateInvested = new Date(inv.dateInvested);
        return dateInvested >= fromDate && dateInvested <= toDate;
      })
      .reduce((sum, inv) => sum + inv.initialAmountKes, 0) || 0;

  return Response.json({
    totalCurrentValueKes,
    totalInitialAmountKes,
    totalGainKes,
    totalGainPercentage,
    investedThisMonth,
    investmentsCount: investments.length || 0,
  });
}
