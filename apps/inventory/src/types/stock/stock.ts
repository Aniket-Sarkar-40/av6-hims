import {
  InvItem,
  InvItemStock,
  Prisma,
} from "@repo/db/generated/prisma/client";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
  IdValue,
} from "@repo/shared/types/global.js";

export interface CreateItemStockInput extends Omit<
  Prisma.InvItemStockUncheckedCreateInput,
  "id" | BaseModelAttr
> {
  quantity: number;
}
export interface UpdateItemStockInput extends CreateItemStockInput {
  id: number;
}

export type ItemStockAudit = Omit<
  Prisma.InvItemStockAuditUncheckedCreateInput,
  "id" | "itemStockId" | "action" | BaseModelAttr
>;

export type ItemStockResponse = Prisma.InvItemStockGetPayload<{
  include: {
    collectionCenter: true;
  };
}>;
export interface ItemStockDTO extends Omit<
  InvItemStock,
  BaseModelAttrWoCancel | "ccId" | "userId" | "itemId"
> {
  item: InvItem | null;
  user: IdValue | null;
}

export interface ItemStockByBatchInput {
  itemId: number;
  batchNo?: string | null;
  ccId: number | null;
  userId?: number;
  expiryDate?: Date | null;
  isFoc?: boolean;
}

export interface RawItemStock {
  id: number;
  item_id: number;
  cc_id: number | null;
  user_id: number | null;
  quantity: number;
  batch_no: string | null;
  expiry_date: string | null;
  is_active: 1 | 0;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_by: number | null;
  deleted_at: string | null;
  is_foc: 1 | 0;
}
