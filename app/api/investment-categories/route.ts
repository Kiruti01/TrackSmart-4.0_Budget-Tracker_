import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const categories = await prisma.investmentCategory.findMany({
    where: {
      OR: [{ isSystemDefault: true }, { userId: user.id }],
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json(categories);
}
