import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type CreateCustomerInput = Omit<
  Prisma.PmsCustomerUncheckedCreateInput,
  BaseModelAttrWoCancel | "id"
>;

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string;
}
