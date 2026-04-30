import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateIncomeHeadInput = Prisma.IncomeHeadUncheckedCreateInput;
export interface UpdateIncomeHeadInput extends CreateIncomeHeadInput {
  id: number;
}
