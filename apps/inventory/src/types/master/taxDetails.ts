import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type TaxDetailsDto = Omit<
  Prisma.TaxDetailsUncheckedCreateInput,
  BaseModelAttr
>;
export type CreateOrUpdateTaxDetails = Omit<
  Prisma.TaxDetailsUncheckedCreateInput,
  BaseModelAttr
>;
