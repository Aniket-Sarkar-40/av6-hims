import { Prisma } from "@repo/db/generated/prisma/client";

export type createExpenseHeadInput = Omit<
  Prisma.ExpenseHeadUncheckedCreateInput,
  "id"
>;
export type updateExpenseHeadInput = Prisma.ExpenseHeadUncheckedCreateInput;

export interface ExpenseHeadDTO {
  id: number;
  expenseCategory: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
