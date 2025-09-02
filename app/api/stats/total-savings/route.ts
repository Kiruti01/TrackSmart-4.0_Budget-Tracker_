import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");

  if (!before) {
    return Response.json({ totalSavings: 0 });
  }

  const beforeDate = new Date(before);

  const totalSavings = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      type: "savings",
      date: {
        lt: beforeDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return Response.json({ totalSavings: totalSavings._sum.amount || 0 });
}