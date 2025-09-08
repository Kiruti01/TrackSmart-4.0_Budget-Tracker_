// import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import History from "@/app/(dashboard)/_components/History";
import Overview from "@/app/(dashboard)/_components/Overview";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import CreateTransactionDialog from "./_components/CreateTransactionDialog";

async function page() {
  const user = await currentUser();
  if (!user) {
    return redirect("/sign-in"); // RETURN here
  }

  let userSettings;
  try {
    userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });
  } catch (err) {
    console.error("Prisma error:", err);
    return redirect("/error"); // optional fallback
  }

  if (!userSettings) {
    return redirect("/wizard"); // RETURN here as well
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <p className="text-3xl font-bold">Hello, {user.firstName}! 👋</p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white w-full sm:w-auto"
                >
                  New income 🤑
                </Button>
              }
              type="income"
            />

            <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white w-full sm:w-auto"
                >
                  New expense 😩
                </Button>
              }
              type="expense"
            />

            <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="border-blue-500 bg-blue-950 text-white hover:bg-blue-700 hover:text-white w-full sm:w-auto"
                >
                  New Savings 🏦
                </Button>
              }
              type="savings"
            />
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />
      <History userSettings={userSettings} />
      <div className="container flex flex-wrap items-center justify-center gap-6 py-8">
        <p className="text-xl font-bold">&copy; {new Date().getFullYear()} Kiruti Tech&trade;</p>
      </div>
    </div>
  );
}

export default page;
