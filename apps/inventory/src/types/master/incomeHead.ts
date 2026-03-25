import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateIncomeHeadInput = Omit<
  Prisma.IncomeHeadUncheckedCreateInput,
  "id"
>;

export type UpdateIncomeHeadInput = Prisma.IncomeHeadUncheckedCreateInput;
