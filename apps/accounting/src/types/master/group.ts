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
