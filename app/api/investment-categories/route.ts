import { supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: categories, error } = await supabase
    .from("investment_categories")
    .select("*")
    .or(`is_system_default.eq.true,user_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(categories);
}
