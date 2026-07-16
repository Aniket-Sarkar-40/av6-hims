import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CreateOrUpdateGroupInput = Omit<
  Prisma.GroupCreateManyInput,
  BaseModelAttrWoCancel
>;

export type GroupResponse = Prisma.GroupGetPayload<{
  include: {
    company: true;
  };
}>;
export interface GroupDTO
  extends Omit<
    GroupResponse,
    BaseModelAttrWoCancel | "company" | "companyId" | "parentId"
  > {
  company: IdValue | null;
  parent: IdValue | null;
}

export type GroupExcelBaseInput = {
  companyId: number;
};

export type GroupExcelRow = {
  Name: string;
  Alias?: string;
  "Is Primary Group"?: string;
  "Parent Group Name"?: string;
  "Primary Category"?: string;
  "Report Type"?: string;
  Nature?: string;
  "Affects Gross Profit"?: string;
};

export type CreateOrUpdateGroupExcelInput = Omit<
  Prisma.GroupExcelUncheckedCreateInput,
  "batchJobId"
>;
