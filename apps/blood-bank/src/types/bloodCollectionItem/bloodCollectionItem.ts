import { BloodCollectionItem } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type BloodCollectionItemDTO = Omit<
  BloodCollectionItem,
  | BaseModelAttrWoCancel
  | "bloodBankCenterId"
  | "collectionId"
  | "stockPostedByStaffId"
>;
