import { getSupabaseClient } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const supabase = getSupabaseClient();

  const { data: investments, error } = await supabase
    .from("investments")
    .select(`
      *,
      investment_categories (
        id,
        name,
        icon
      )
    `)
    .eq("user_id", user.id)
    .order("date_invested", { ascending: false });

  if (error) {
    console.error("Error fetching investments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const transformedInvestments = (investments || []).map((inv: any) => {
    const category = inv.investment_categories;
    return {
      id: inv.id,
      userId: inv.user_id,
      name: inv.name,
      categoryId: inv.category_id,
      currency: inv.currency,
      initialAmount: inv.initial_amount ?? 0,
      initialExchangeRate: inv.initial_exchange_rate ?? 1,
      initialAmountKes: inv.initial_amount_kes ?? 0,
      currentAmount: inv.current_amount ?? inv.initial_amount ?? 0,
      currentExchangeRate: inv.current_exchange_rate ?? inv.initial_exchange_rate ?? 1,
      currentValueKes: inv.current_value_kes ?? inv.initial_amount_kes ?? 0,
      totalInvested: inv.total_invested ?? inv.initial_amount ?? 0,
      dateInvested: inv.date_invested,
      lastUpdated: inv.last_updated,
      notes: inv.notes,
      createdAt: inv.created_at,
      category: category ? {
        id: category.id,
        userId: category.user_id,
        name: category.name,
        icon: category.icon,
        isSystemDefault: category.is_system_default,
        createdAt: category.created_at,
      } : undefined,
    };
  });

  return Response.json(transformedInvestments);
}