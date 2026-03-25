import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type InvBatchJobInput = Omit<
  Prisma.InvBatchJobCreateInput,
  "batchJobDetails" | BaseModelAttr
> & {
  batchJobNo?: string;
};

export type InvBatchJobDetailsInput = Omit<
  Prisma.InvBatchJobDetailsUncheckedCreateInput,
  "id" | "rowTitle" | "rowNo" | "errorMsg" | "batch"
>;
