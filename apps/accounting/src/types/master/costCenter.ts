import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CreateOrUpdateCostCenterInput = Omit<
  Prisma.CostCenterUncheckedCreateWithoutChildrenInput,
  BaseModelAttrWoCancel | "status"
>;

export type CostCenterResponse = Prisma.CostCenterGetPayload<{
  include: {
    company: true;
  };
}>;

export interface CostCenterDTO
  extends Omit<
    CostCenterResponse,
    BaseModelAttrWoCancel | "companyId" | "parentId" | "company"
  > {
  company: IdValue | null;
  parent: IdValue | null;
}
