export interface CreateIncomeHeadInput {
  incomeCategory: string;
  description?: string | null;
}

export interface UpdateIncomeHeadInput {
  id: number;
  incomeCategory?: string;
  description?: string | null;
}
