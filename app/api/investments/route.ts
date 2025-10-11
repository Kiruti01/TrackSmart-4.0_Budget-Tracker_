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

  return Response.json(investments || []);
}