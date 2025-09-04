import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Get cumulative savings up to the start of the period
  const cumulativeSavings = await getCumulativeSavings(user.id);
  
  return Response.json({
    totalCumulativeSavings: cumulativeSavings.totalSavings,
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