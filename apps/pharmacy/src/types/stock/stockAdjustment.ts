import {
  Action,
  PmsItem,
  Prisma,
  StockAdjustmentDetails,
} from "@repo/db/generated/prisma/client";
import { DecimalToNumber } from "@repo/platform/types/common.js";
import { IdValue } from "@repo/shared/types/global.js";

export interface CreateStockAjustmentInput extends Omit<
  Prisma.StockAdjustmentUncheckedCreateInput,
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
  Prisma.StockAdjustmentDetailsUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
>;

export interface UpdateStockAdjustmentDetailsInput extends CreateStockAdjustmentDetailsInput {
  id?: number;
}

export interface UpdateStockAjustmentInput extends CreateStockAjustmentInput {
  id: number;
  stockAdjustmentDetails: UpdateStockAdjustmentDetailsInput[];
  existing: StockAdjustmentResponse;
}

export type StockAdjustmentResponse = Prisma.StockAdjustmentGetPayload<{
  include: {
    stockAdjustmentDetails: true;
  };
}>;

export interface StockAdjustmentDetailsDTO extends Omit<
  StockAdjustmentDetails,
  | "itemId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> {
  item: DecimalToNumber<PmsItem> | null;
}
export interface StockAdjustmentDTO extends Omit<
  StockAdjustmentResponse,
  | "ccId"
  | "branchId"
  | "warehouseId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "updatedAt"
  | "deletedBy"
  | "deletedAt"
  | "stockAdjustmentDetails"
> {
  collectionCenter: IdValue | null;
  branch: IdValue | null;
  warehouse: IdValue | null;
  stockAdjustmentDetails: StockAdjustmentDetailsDTO[];
  createdBy: IdValue | null;
}

export interface StockAdjustmentMistmatchAvailQtyDTO {
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
