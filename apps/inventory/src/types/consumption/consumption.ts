import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { ConsumptionDetails } from "@repo/db/generated/prisma/client";
import { EmployeeCache } from "av6-core-v2";
import { ItemMasterToDto } from "../grn/grn.js";

export interface ConsumptionCreateInput
  extends Omit<
    Prisma.ConsumptionUncheckedCreateInput,
    | "id"
    | "consumptionDetails"
    | "approvedBy"
    | "rejectedBy"
    | "approvedAt"
    | "rejectedAt"
    | BaseModelAttr
  > {
  consumptionDetails: ConsumptionDetailsCreateInput[];
}

export interface ConsumptionUpdateInput extends ConsumptionCreateInput {
  id: number;
  consumptionDetails: ConsumptionDetailsUpdateInput[];
  existing: ConsumptionResponse;
}

export interface ConsumptionApproveInput extends ConsumptionCreateInput {
  id: number;
  consumptionDetails: ConsumptionDetailsApproveInput[];
  existing: ConsumptionResponse;
}

export interface ConsumptionDetailsCreateInput
  extends Omit<
    Prisma.ConsumptionDetailsUncheckedCreateInput,
    "id" | BaseModelAttr
  > {
  isBatch: boolean;
  isExpiry: boolean;
}

export interface ConsumptionDetailsUpdateInput
  extends ConsumptionDetailsCreateInput {
  id: number;
}
export interface ConsumptionDetailsApproveInput
  extends ConsumptionDetailsCreateInput {
  id: number;
  consumedQty: number;
  isBatch: boolean;
  isExpiry: boolean;
  ccId: number | null;
}

export type ConsumptionResponse = Prisma.ConsumptionGetPayload<{
  include: {
    consumptionDetails: true;
  };
}>;

export interface ConsumptionDTO
  extends Omit<
    ConsumptionResponse,
    | "consumptionDetails"
    | "ccId"
    | "requestedBy"
    | "rejectedBy"
    | "approvedBy"
    | BaseModelAttr
  > {
  requestedBy: EmployeeCache | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
  rejectedBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  deletedBy: EmployeeCache | null;
  consumptionDetails: ConsumptionDetailsDTO[];
  collectionCenter: IdValue | null;
}

export interface ConsumptionDetailsDTO
  extends Omit<ConsumptionDetails, "itemId" | BaseModelAttr> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}

export interface ConDetailDTO
  extends Omit<ConsumptionDetails, "itemId" | "createdBy" | "updatedBy"> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}

export interface CommonConsumptionInput {
  id: number;
  ccId: number;
  userId: number;
  description?: string;
}
