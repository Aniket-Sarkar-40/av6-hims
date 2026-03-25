import {
  InvInTransitStock,
  InvOperation,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";

export type CreateInTransitStockInput = Omit<
  Prisma.InvInTransitStockUncheckedCreateInput,
  "id"
>;

export interface inTransitStockAudit {
  operation: InvOperation;
  refId?: number;
  refDetailsId?: number;
  refNo?: string;
  refDate?: Date;
  refApprovedBy?: number;
  refApprovedAt?: Date;
}

export interface inTransitStockDTO extends Omit<
  InvInTransitStock,
  "fromId" | "toId" | "itemId" | BaseModelAttr
> {
  from: IdValue | null;
  to: IdValue | null;
  item: IdValue | null;
}
