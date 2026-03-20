import {
  PercentageOrAmount,
  Prisma,
  ProcedureMaster,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateProcedureMasterInput = Omit<
  Prisma.ProcedureMasterUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdateProcedureMasterInput extends CreateProcedureMasterInput {
  id: number;
}

export interface ProcedureMasterDTO extends Omit<
  ProcedureMaster,
  "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "deletedAt"
> {
  collectionCenter: IdValue | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}

/*----------Fetch Procedure based on Insurance or Corporate-------------*/

export interface FetchProcedureInput {
  procedureId: number;
  type?: "INSURANCE" | "CORPORATE";
  typeId?: number;
}

export interface FetchProcedureResponse {
  id: number;
  procedureName: string | null;
  procedureCharge: number | null;
  type: "INSURANCE" | "CORPORATE" | null;
  typeId: number | null;
  coPaymentType: PercentageOrAmount | null;
  coPaymentValue: number | null;
}
