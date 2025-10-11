"use server";

import { getSupabaseClient } from "@/lib/supabase";
import {
  CreateInvestmentSchema,
  CreateInvestmentSchemaType,
  UpdateInvestmentValueSchema,
  UpdateInvestmentValueSchemaType,
  CreateInvestmentCategorySchema,
  CreateInvestmentCategorySchemaType,
} from "@/schema/investment";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function CreateInvestment(form: CreateInvestmentSchemaType) {
  const parsedBody = CreateInvestmentSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const {
    name,
    categoryId,
    currency,
    initialAmount,
    exchangeRate,
    currentAmount,
    currentExchangeRate,
    dateInvested,
    notes,
  } = parsedBody.data;

  const initialAmountKes = initialAmount * exchangeRate;
  const finalCurrentAmount = currentAmount || initialAmount;
  const finalCurrentExchangeRate = currentExchangeRate || exchangeRate;
  const currentValueKes = finalCurrentAmount * finalCurrentExchangeRate;
  const supabase = getSupabaseClient();

  const { data: investment, error } = await supabase
    .from("investments")
    .insert({
      user_id: user.id,
      name,
      category_id: categoryId,
      currency,
      initial_amount: initialAmount,
      initial_exchange_rate: exchangeRate,
      initial_amount_kes: initialAmountKes,
      current_amount: finalCurrentAmount,
      current_exchange_rate: finalCurrentExchangeRate,
      current_value_kes: currentValueKes,
      total_invested: initialAmount,
      date_invested: dateInvested,
      notes: notes || null,
      last_updated: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: categoryData } = await supabase
    .from("investment_categories")
    .select("name, icon")
    .eq("id", categoryId)
    .single();

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "investment",
      category: categoryData?.name || "Investment",
      categoryIcon: categoryData?.icon || "💰",
      description: `Investment: ${name}`,
      amount: initialAmountKes,
      date: new Date(dateInvested),
    },
  });

  const dateObj = new Date(dateInvested);
  await prisma.$transaction([
    prisma.monthHistory.upsert({
      where: {
        userId_day_month_year: {
          userId: user.id,
          day: dateObj.getUTCDate(),
          month: dateObj.getUTCMonth(),
          year: dateObj.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: dateObj.getUTCDate(),
        month: dateObj.getUTCMonth(),
        year: dateObj.getUTCFullYear(),
        investment: initialAmountKes,
        income: 0,
        expense: 0,
        savings: 0,
      },
      update: {
        investment: {
          increment: initialAmountKes,
        },
      },
    }),
    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: dateObj.getUTCMonth(),
          year: dateObj.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: dateObj.getUTCMonth(),
        year: dateObj.getUTCFullYear(),
        investment: initialAmountKes,
        income: 0,
        expense: 0,
        savings: 0,
      },
      update: {
        investment: {
          increment: initialAmountKes,
        },
      },
    }),
  ]);

  return investment;
}

export async function UpdateInvestmentValue(
  form: UpdateInvestmentValueSchemaType
) {
  const parsedBody = UpdateInvestmentValueSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const {
    investmentId,
    updateType,
    newAmount,
    exchangeRate,
    additionalCapital,
    updateDate,
    notes,
  } = parsedBody.data;

  const supabase = getSupabaseClient();

  const { data: investment, error: fetchError } = await supabase
    .from("investments")
    .select("*")
    .eq("id", investmentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !investment) {
    throw new Error("Investment not found");
  }

  const previousAmount = Number(investment.current_amount);
  const previousExchangeRate = Number(investment.current_exchange_rate);
  const previousValueKes = Number(investment.current_value_kes);

  let finalNewAmount = Number(newAmount);
  let finalTotalInvested = Number(investment.total_invested);

  if (updateType === "capital_addition" && additionalCapital) {
    finalTotalInvested += Number(additionalCapital);
  }

  const newValueKes = finalNewAmount * Number(exchangeRate);

  const gainLossCurrency = finalNewAmount - previousAmount;
  const gainLossKes = newValueKes - previousValueKes;
  const percentageChangeCurrency =
    previousAmount > 0 ? (gainLossCurrency / previousAmount) * 100 : 0;
  const percentageChangeKes =
    previousValueKes > 0 ? (gainLossKes / previousValueKes) * 100 : 0;

  const { error: updateError } = await supabase
    .from("investments")
    .update({
      current_amount: finalNewAmount,
      current_exchange_rate: exchangeRate,
      current_value_kes: newValueKes,
      total_invested: finalTotalInvested,
      last_updated: new Date().toISOString(),
    })
    .eq("id", investmentId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: insertError } = await supabase
    .from("investment_updates")
    .insert({
      investment_id: investmentId,
      update_type: updateType,
      previous_amount: previousAmount,
      new_amount: finalNewAmount,
      previous_exchange_rate: previousExchangeRate,
      new_exchange_rate: exchangeRate,
      previous_value_kes: previousValueKes,
      new_value_kes: newValueKes,
      additional_capital: additionalCapital || null,
      gain_loss_currency: gainLossCurrency,
      gain_loss_kes: gainLossKes,
      percentage_change_currency: percentageChangeCurrency,
      percentage_change_kes: percentageChangeKes,
      update_date: updateDate,
      notes: notes || null,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  if (updateType === "capital_addition" && additionalCapital) {
    const additionalCapitalKes = Number(additionalCapital) * Number(exchangeRate);

    const { data: categoryData } = await supabase
      .from("investment_categories")
      .select("name, icon")
      .eq("id", investment.category_id)
      .single();

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "investment",
        category: categoryData?.name || "Investment",
        categoryIcon: categoryData?.icon || "💰",
        description: `Capital Addition: ${investment.name}`,
        amount: additionalCapitalKes,
        date: new Date(updateDate),
      },
    });

    const dateObj = new Date(updateDate);
    await prisma.$transaction([
      prisma.monthHistory.upsert({
        where: {
          userId_day_month_year: {
            userId: user.id,
            day: dateObj.getUTCDate(),
            month: dateObj.getUTCMonth(),
            year: dateObj.getUTCFullYear(),
          },
        },
        create: {
          userId: user.id,
          day: dateObj.getUTCDate(),
          month: dateObj.getUTCMonth(),
          year: dateObj.getUTCFullYear(),
          investment: additionalCapitalKes,
          income: 0,
          expense: 0,
          savings: 0,
        },
        update: {
          investment: {
            increment: additionalCapitalKes,
          },
        },
      }),
      prisma.yearHistory.upsert({
        where: {
          month_year_userId: {
            userId: user.id,
            month: dateObj.getUTCMonth(),
            year: dateObj.getUTCFullYear(),
          },
        },
        create: {
          userId: user.id,
          month: dateObj.getUTCMonth(),
          year: dateObj.getUTCFullYear(),
          investment: additionalCapitalKes,
          income: 0,
          expense: 0,
          savings: 0,
        },
        update: {
          investment: {
            increment: additionalCapitalKes,
          },
        },
      }),
    ]);
  }

  return { success: true };
}

export async function DeleteInvestment(investmentId: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", investmentId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function CreateInvestmentCategory(
  form: CreateInvestmentCategorySchemaType
) {
  const parsedBody = CreateInvestmentCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name, icon } = parsedBody.data;
  const supabase = getSupabaseClient();

  const { data: category, error } = await supabase
    .from("investment_categories")
    .insert({
      user_id: user.id,
      name,
      icon,
      is_system_default: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await prisma.category.create({
    data: {
      name,
      userId: user.id,
      icon,
      type: "investment",
    },
  });

  return category;
}

export async function DeleteInvestmentCategory(categoryId: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const supabase = getSupabaseClient();

  const { data: category, error: fetchError } = await supabase
    .from("investment_categories")
    .select()
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .eq("is_system_default", false)
    .single();

  if (fetchError || !category) {
    throw new Error("Category not found or cannot be deleted");
  }

  const { error: deleteError } = await supabase
    .from("investment_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  await prisma.category.deleteMany({
    where: {
      name: category.name,
      userId: user.id,
      type: "investment",
    },
  });

  return { success: true };
}
