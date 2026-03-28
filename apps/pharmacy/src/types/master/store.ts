import { BranchDTO } from "./branch.js";
import { WarehouseDTO } from "./warehouse.js";

export interface StoreCreateInput {
  name: string;
  stockCode?: string | null;
  description?: string | null;
  branchId?: number | null;
  wareHouseId?: number | null;
}
export interface StoreUpdateInput extends StoreCreateInput {
  id: number;
}

export interface storeDTO {
  id: number;
  name: string;
  stockCode: string | null;
  description: string | null;
  branch: BranchDTO | null;
  wareHouse: WarehouseDTO | null;
  createdAt: Date;
  updatedAt: Date;
}
