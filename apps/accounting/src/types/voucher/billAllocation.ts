import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";

export type CreateOrUpdateBillAllocationInput = Omit<
  Prisma.BillAllocationCreateManyInput,
  BaseModelAttrWoCancel
>;
