import { getEndOfDayUTC, getStartOfDayUTC } from "@/lib/helpers";
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

  // Validate and parse query params
  const queryParams = OverviewQuerySchema.safeParse({ from, to });
  if (!queryParams.success) {
    console.error(
      "Categories query params validation failed:",
      queryParams.error
    );
    throw new Error(queryParams.error.message);
  }

  // Convert to UTC start/end of day
  const parsedFromUTC = getStartOfDayUTC(queryParams.data.from);
  const parsedToUTC = getEndOfDayUTC(queryParams.data.to);

  const stats = await getCategoriesStats(user.id, parsedFromUTC, parsedToUTC);

  // console.log("Categories stats result:", stats);
  return Response.json(stats);
}

export type GetCategoriesStatsResponseType = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  // console.log(
  //   "Getting categories stats for user:",
  //   userId,
  //   "from:",
  //   from,
  //   "to:",
  //   to
  // );

  const stats = await prisma.transaction.groupBy({
    by: ["type", "category", "categoryIcon"],
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
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  // console.log("Categories stats raw result:", stats);
  return stats;
}
