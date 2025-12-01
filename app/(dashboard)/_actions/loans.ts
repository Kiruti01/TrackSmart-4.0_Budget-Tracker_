"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  CreateLoanSchema,
  CreateLoanSchemaType,
  UpdateLoanSchema,
  UpdateLoanSchemaType,
  DeleteLoanSchema,
  DeleteLoanSchemaType,
} from "@/schema/loans";
import { getSupabaseClient } from "@/lib/supabase";

export async function CreateLoan(form: CreateLoanSchemaType) {
  const parsedBody = CreateLoanSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { personName, amount, description, dateLent } = parsedBody.data;
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("loans").insert({
    user_id: user.id,
    person_name: personName,
    amount,
    description: description || "",
    date_lent: dateLent.toISOString(),
    is_paid_back: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function UpdateLoan(form: UpdateLoanSchemaType) {
  const parsedBody = UpdateLoanSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id, isPaidBack, datePaidBack } = parsedBody.data;
  const supabase = getSupabaseClient();

  const updateData: {
    is_paid_back: boolean;
    date_paid_back?: string | null;
    updated_at: string;
  } = {
    is_paid_back: isPaidBack,
    updated_at: new Date().toISOString(),
  };

  if (isPaidBack && datePaidBack) {
    updateData.date_paid_back = datePaidBack.toISOString();
  } else if (!isPaidBack) {
    updateData.date_paid_back = null;
  }

  const { error } = await supabase
    .from("loans")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function DeleteLoan(form: DeleteLoanSchemaType) {
  const parsedBody = DeleteLoanSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id } = parsedBody.data;
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
