import { getSupabaseClient } from "@/lib/supabase"; // Import function, not instance
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Create client inside the handler
  const supabase = getSupabaseClient();

  const { data: investments, error } = await supabase
    .from("investments")
    .select(`
      *,
      category:investment_categories(*)
    `)
    .eq("user_id", user.id)
    .order("date_invested", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(investments);
}