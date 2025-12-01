import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", user.id)
    .order("date_lent", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export type GetLoansResponseType = Awaited<{
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  description: string;
  date_lent: string;
  is_paid_back: boolean;
  date_paid_back: string | null;
  created_at: string;
  updated_at: string;
}[]>;
