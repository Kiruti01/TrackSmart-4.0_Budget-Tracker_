"use server";

import prisma from "@/lib/prisma";
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

  const investment = await prisma.investment.create({
    data: {
      userId: user.id,
      name,
      categoryId,
      currency,
      initialAmount,
      initialExchangeRate: exchangeRate,
      initialAmountKes,
      currentAmount: finalCurrentAmount,
      currentExchangeRate: finalCurrentExchangeRate,
      currentValueKes,
      totalInvested: initialAmount,
      dateInvested,
      notes: notes || null,
      lastUpdated: new Date(),
    },
  });

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

  const investment = await prisma.investment.findFirst({
    where: {
      id: investmentId,
      userId: user.id,
    },
  });

  if (!investment) {
    throw new Error("Investment not found");
  }

  const previousAmount = investment.currentAmount;
  const previousExchangeRate = investment.currentExchangeRate;
  const previousValueKes = investment.currentValueKes;

  let finalNewAmount = newAmount;
  let finalTotalInvested = investment.totalInvested;

  if (updateType === "capital_addition" && additionalCapital) {
    finalTotalInvested += additionalCapital;
  }

  const newValueKes = finalNewAmount * exchangeRate;

  const gainLossCurrency = finalNewAmount - previousAmount;
  const gainLossKes = newValueKes - previousValueKes;
  const percentageChangeCurrency =
    previousAmount > 0 ? (gainLossCurrency / previousAmount) * 100 : 0;
  const percentageChangeKes =
    previousValueKes > 0 ? (gainLossKes / previousValueKes) * 100 : 0;

  await prisma.$transaction([
    prisma.investment.update({
      where: {
        id: investmentId,
      },
      data: {
        currentAmount: finalNewAmount,
        currentExchangeRate: exchangeRate,
        currentValueKes: newValueKes,
        totalInvested: finalTotalInvested,
        lastUpdated: new Date(),
      },
    }),
    prisma.investmentUpdate.create({
      data: {
        investmentId,
        updateType,
        previousAmount,
        newAmount: finalNewAmount,
        previousExchangeRate,
        newExchangeRate: exchangeRate,
        previousValueKes,
        newValueKes,
        additionalCapital: additionalCapital || null,
        gainLossCurrency,
        gainLossKes,
        percentageChangeCurrency,
        percentageChangeKes,
        updateDate,
        notes: notes || null,
      },
    }),
  ]);

  return { success: true };
}

export async function DeleteInvestment(investmentId: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  await prisma.investment.delete({
    where: {
      id: investmentId,
      userId: user.id,
    },
  });

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

  const category = await prisma.investmentCategory.create({
    data: {
      userId: user.id,
      name,
      icon,
      isSystemDefault: false,
    },
  });

  return category;
}
