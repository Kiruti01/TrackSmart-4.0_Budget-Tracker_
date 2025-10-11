import { getSupabaseClient } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const supabase = getSupabaseClient();

  const { data: categories, error } = await supabase
    .from("investment_categories")
    .select("*")
    .eq("is_system_default", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching investment categories:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(categories || []);
}
