import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CreateOrUpdateVoucherTypeInput = Omit<
  Prisma.VoucherTypeUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export type VoucherTypeResponse = Prisma.VoucherTypeGetPayload<{
  include: {
    company: true;
  };
}>;

export interface VoucherTypeDTO extends Omit<
  VoucherTypeResponse,
  BaseModelAttrWoCancel | "company" | "companyId"
> {
  company: IdValue | null;
}
