import { getSupabaseClient } from "@/lib/supabase";
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

  const supabase = getSupabaseClient();

  const { data: investments, error } = await supabase
    .from("investments")
    .select(`
      id,
      current_value_kes,
      initial_amount_kes,
      total_invested,
      date_invested,
      category_id,
      investment_categories (
        id,
        name,
        icon
      )
    `)
    .eq("user_id", user.id)
    .gte("date_invested", from)
    .lte("date_invested", to);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const categoryMap = new Map<string, {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    totalValue: number;
    totalInvested: number;
  }>();

  investments.forEach((inv: any) => {
    const category = inv.investment_categories;
    if (!category) return;

    const existing = categoryMap.get(category.id);
    if (existing) {
      existing.totalValue += Number(inv.current_value_kes);
      existing.totalInvested += Number(inv.total_invested);
    } else {
      categoryMap.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        totalValue: Number(inv.current_value_kes),
        totalInvested: Number(inv.total_invested),
      });
    }
  });

  const result = Array.from(categoryMap.values()).map((cat) => ({
    ...cat,
    totalGain: cat.totalValue - cat.totalInvested,
    gainPercentage: cat.totalInvested > 0
      ? ((cat.totalValue - cat.totalInvested) / cat.totalInvested) * 100
      : 0,
  }));

  return Response.json(result);
}
