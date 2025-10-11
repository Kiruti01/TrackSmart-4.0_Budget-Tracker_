import { getSupabaseClient } from "@/lib/supabase";
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

  const supabase = getSupabaseClient();

  const { data: investments, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching investments stats:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const investmentsList = investments || [];

  const totalCurrentValueKes =
    investmentsList.reduce((sum, inv) => sum + Number(inv.current_value_kes), 0) || 0;

  const totalInitialAmountKes =
    investmentsList.reduce((sum, inv) => sum + Number(inv.initial_amount_kes), 0) || 0;

  const totalGainKes = totalCurrentValueKes - totalInitialAmountKes;
  const totalGainPercentage =
    totalInitialAmountKes > 0
      ? (totalGainKes / totalInitialAmountKes) * 100
      : 0;

  const investedThisMonth =
    investmentsList
      .filter((inv) => {
        const dateInvested = new Date(inv.date_invested);
        return dateInvested >= fromDate && dateInvested <= toDate;
      })
      .reduce((sum, inv) => sum + Number(inv.initial_amount_kes), 0) || 0;

  return Response.json({
    totalCurrentValueKes,
    totalInitialAmountKes,
    totalGainKes,
    totalGainPercentage,
    investedThisMonth,
    investmentsCount: investmentsList.length || 0,
  });
}
