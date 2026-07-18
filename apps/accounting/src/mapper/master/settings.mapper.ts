import { getCollectionCenterByIdFromDb } from "@/repository/master/collectionCenter.repository.js";
import { SettingsDTO } from "@/types/settings/settings.js";
import { AccSettings } from "@repo/db/generated/prisma/client";

import { customOmit, toIdValue } from "av6-utils";

export const toSettingsDto = async (
  data: AccSettings,
): Promise<SettingsDTO> => {
  const collectionCenter = await getCollectionCenterByIdFromDb(
    data.mainBranchId,
  );
  return {
    ...customOmit(data, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "mainBranchId",
    ]).rest,
    mainBranch: toIdValue(collectionCenter, "colName"),
  };
};
