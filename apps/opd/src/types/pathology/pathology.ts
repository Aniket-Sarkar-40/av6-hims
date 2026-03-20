import { PathologyMaster } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export interface PathologyMasterDTO extends Omit<
  PathologyMaster,
  "ccId" | "isActive" | "orderable"
> {
  collectionCenter: IdValue | null;
}
