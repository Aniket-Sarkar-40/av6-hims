import { GPStatus, PMS_PRIORITY } from "@repo/db/generated/prisma/enums.js";
import { WarehouseDTO } from "../master/warehouse.js";
import { EmployeeCache } from "../staff/employee.js";
import {
  Distributor,
  PmsPurchaseOrder,
} from "@repo/db/generated/prisma/client";

export interface CreateOrUpdateGatePassInput {
  id?: number;
  distributorId: number;
  warehouseId: number;
  totalQuantity: number;
  poNumber: string;
  poDate: Date;
  boxCount: number;
  billAmount: number;
  invoiceNumber?: string | null;
  remarks?: string | null;
  priority?: PMS_PRIORITY | null;
  status?: GPStatus;
}

export interface GatePassDto {
  id: number;
  date: Date;
  distributor: Distributor | null;
  warehouse: WarehouseDTO | null;
  totalQuantity: number;
  poNumber: string;
  poDate: Date;
  boxCount: number;
  billAmount: number;
  gatePassNumber: string;
  invoiceNumber: string | null;
  remarks: string | null;
  priority: PMS_PRIORITY | null;
  status: GPStatus;
  purchaseOrder: PmsPurchaseOrder | null;
  createdBy: EmployeeCache | null;
}

export interface GatePassFilter {
  poDateStart?: Date;
  poDateEnd?: Date;
  poNumber?: string;
  status?: GPStatus;
}
