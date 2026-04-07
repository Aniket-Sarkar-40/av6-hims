export interface createExpenseHeadInput {
  expenseCategory: string;
  description?: string | null;
}
export interface updateExpenseHeadInput {
  id: number;
  expenseCategory: string;
  description?: string | null;
}

export interface ExpenseHeadDTO {
  id: number;
  expenseCategory: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
