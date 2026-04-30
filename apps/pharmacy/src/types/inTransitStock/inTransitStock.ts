import {
  PmsInTransitStock,
  PmsItem,
  PmsOperation,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BranchDTO } from "../master/branch.js";
import { WarehouseDTO } from "../master/warehouse.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";

export interface CreateInTransitStockInput {
  id?: number;
  fromId: number;
  toId: number;
  itemId: number;
  quantity: number;
  batchNo: string;
  expiryDate?: Date;
  isFoc: boolean;
}

export interface inTransitStockAudit {
  operation: PmsOperation;
  refId?: number;
  refDetailsId?: number;
  refNo?: string;
  refDate?: Date;
  refApprovedBy?: number;
  refApprovedAt?: Date;
}

export interface inTransitStockDTO
  extends Omit<PmsInTransitStock, "fromId" | "toId" | "itemId" | "isActive"> {
  from: WarehouseDTO | BranchDTO | null;
  to: WarehouseDTO | BranchDTO | null;
  item: DecimalToNumber<PmsItem> | null;
}
