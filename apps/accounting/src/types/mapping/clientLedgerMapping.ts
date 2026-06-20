import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";

export type CreateOrUpdateClientLedgerMappingInput = Omit<
  Prisma.ClientLedgerMappingUncheckedCreateInput,
  BaseModelAttrWoCancel
>;
