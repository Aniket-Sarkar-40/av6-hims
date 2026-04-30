import { Expense, Prisma } from "@repo/db/generated/prisma/client";

export type createExpenseHeadInput = Prisma.ExpenseHeadUncheckedCreateInput;

export interface updateExpenseHeadInput extends createExpenseHeadInput {
  id: number;
}

export interface ExpenseHeadDTO
  extends Omit<Expense, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}
