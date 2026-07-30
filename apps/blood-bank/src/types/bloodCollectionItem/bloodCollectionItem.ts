import { BloodCollectionItem, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodCollectionItem = Omit<
  Prisma.BloodCollectionItemUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodCollectionItemDTO extends Omit<
  BloodCollectionItem,
  | BaseModelAttrWoCancel
  | "bloodBankCenterId"
  | "collectionId"
  | "stockPostedByStaffId"
> {
  bloodBankCenter: IdValue | null;
  collection: IdValue | null;
  stockPostedByStaff: IdValue | null;
}
