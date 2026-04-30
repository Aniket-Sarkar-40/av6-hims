import { Prisma } from "@repo/db/generated/prisma/browser.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type MedicineDistMapReq = Omit<
  Prisma.MedicineDistributorMapUncheckedCreateInput,
  BaseModelAttrWoCancel
>;
