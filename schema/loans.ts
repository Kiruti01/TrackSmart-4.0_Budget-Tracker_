import { z } from "zod";

export const CreateLoanSchema = z.object({
  personName: z.string().min(1, "Person name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
  dateLent: z.coerce.date(),
});

export type CreateLoanSchemaType = z.infer<typeof CreateLoanSchema>;

export const UpdateLoanSchema = z.object({
  id: z.string().uuid(),
  isPaidBack: z.boolean(),
  datePaidBack: z.coerce.date().optional(),
});

export type UpdateLoanSchemaType = z.infer<typeof UpdateLoanSchema>;

export const DeleteLoanSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteLoanSchemaType = z.infer<typeof DeleteLoanSchema>;
