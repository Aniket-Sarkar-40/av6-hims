import {
  Action,
  InvStockAdjustment,
  InvStockAdjustmentDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";
import { InvItem } from "@repo/db/generated/prisma/client";

export interface CreateStockAjustmentInput extends Omit<
  Prisma.InvStockAdjustmentUncheckedCreateInput,
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "stockAdjustmentDetails"
> {
  stockAdjustmentDetails: CreateStockAdjustmentDetailsInput[];
  isAvailQtyCheck: boolean;
}

export type CreateStockAdjustmentDetailsInput = Omit<
  Prisma.InvStockAdjustmentDetailsUncheckedCreateInput,
  "id" | BaseModelAttr
>;

export interface UpdateStockAdjustmentDetailsInput extends CreateStockAdjustmentDetailsInput {
  id?: number;
}

export interface UpdateStockAjustmentInput extends CreateStockAjustmentInput {
  id: number;
  stockAdjustmentDetails: UpdateStockAdjustmentDetailsInput[];
  existing: StockAdjustmentResponse;
}

export type StockAdjustmentResponse = Prisma.InvStockAdjustmentGetPayload<{
  include: {
    stockAdjustmentDetails: true;
    cc: true;
    targetCc: true;
  };
}>;

export interface StockAdjustmentDetailsDTO extends Omit<
  InvStockAdjustmentDetails,
  | "itemId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> {
  item: InvItem | null;
}
export interface StockAdjustmentDTO extends Omit<
  InvStockAdjustment,
  | "ccId"
  | "targetCcId"
  | "isActive"
  | "updatedBy"
  | "updatedAt"
  | "deletedBy"
  | "deletedAt"
  | "stockAdjustmentDetails"
> {
  collectionCenter: IdValue | null;
  targetCollectionCenter: IdValue | null;
  stockAdjustmentDetails: StockAdjustmentDetailsDTO[];
}

export interface StockAdjustmentMismatchAvailQtyDTO {
  rowNo: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  exptAvailQty: number;
  actlAvailQty: number;
  adjustType: Action;
  quantity: number;
  batchId: number;
}
