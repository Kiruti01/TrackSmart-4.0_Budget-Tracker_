import { z } from "zod";

export const CreateInvestmentSchema = z.object({
  name: z.string().min(1, "Investment name is required").max(100),
  categoryId: z.string().uuid("Invalid category"),
  currency: z.string().min(1, "Currency is required").max(10),
  initialAmount: z.coerce
    .number()
    .positive("Initial amount must be positive")
    .finite(),
  exchangeRate: z.coerce
    .number()
    .positive("Exchange rate must be positive")
    .finite(),
  currentAmount: z.coerce.number().positive().finite().optional(),
  currentExchangeRate: z.coerce.number().positive().finite().optional(),
  dateInvested: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export const UpdateInvestmentValueSchema = z.object({
  investmentId: z.string().uuid("Invalid investment ID"),
  updateType: z.enum(["value_update", "capital_addition"]),
  newAmount: z.coerce.number().positive("Amount must be positive").finite(),
  exchangeRate: z.coerce
    .number()
    .positive("Exchange rate must be positive")
    .finite(),
  additionalCapital: z.coerce.number().positive().finite().optional(),
  updateDate: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export const CreateInvestmentCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  icon: z.string().min(1, "Icon is required").max(10),
});

export type CreateInvestmentSchemaType = z.infer<typeof CreateInvestmentSchema>;
export type UpdateInvestmentValueSchemaType = z.infer<
  typeof UpdateInvestmentValueSchema
>;
export type CreateInvestmentCategorySchemaType = z.infer<
  typeof CreateInvestmentCategorySchema
>;
