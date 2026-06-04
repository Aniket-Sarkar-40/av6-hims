import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel, IdValue } from "@repo/shared/types/global.js";

export type ItemSupplierCreateInput = Omit<
  Prisma.InvItemSupplierUncheckedCreateInput,
  "id"
> & {
  taxIdentificationDetails?: Prisma.TaxIdentificationDetailsUncheckedCreateInput[];
  bankDetails?: Prisma.BankDetailsUncheckedCreateInput[];
};

export interface ItemSupplierUpdateInput extends ItemSupplierCreateInput {
  id: number;
  existingItemSupplier: ItemSupplierDTO;
}

export type ItemSupplierResponse = Prisma.InvItemSupplierGetPayload<{
  include: {
    taxIdentificationDetails: true;
    bankDetails: true;
  };
}>;

export interface ItemSupplierDTO
  extends Omit<ItemSupplierResponse, BaseModelAttrWoCancel | "taxDetailsId"> {
  taxDetails: IdValue | null;
}
