import { getSupabaseClient } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

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
  const { data: investments, error: investmentsError } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id);

  if (investmentsError) {
    return Response.json({ error: investmentsError.message }, { status: 500 });
  }

  const totalCurrentValueKes = investments?.reduce(
    (sum, inv) => sum + Number(inv.current_value_kes),
    0
  ) || 0;

  const totalInitialAmountKes = investments?.reduce(
    (sum, inv) => sum + Number(inv.initial_amount_kes),
    0
  ) || 0;

  const totalGainKes = totalCurrentValueKes - totalInitialAmountKes;
  const totalGainPercentage = totalInitialAmountKes > 0
    ? (totalGainKes / totalInitialAmountKes) * 100
    : 0;

  const investedThisMonth = investments?.filter((inv) => {
    const dateInvested = new Date(inv.date_invested);
    return dateInvested >= fromDate && dateInvested <= toDate;
  }).reduce((sum, inv) => sum + Number(inv.initial_amount_kes), 0) || 0;

  return Response.json({
    totalCurrentValueKes,
    totalInitialAmountKes,
    totalGainKes,
    totalGainPercentage,
    investedThisMonth,
    investmentsCount: investments?.length || 0,
  });
}
