import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";

export const getCostCentersByIds = async (companyId: number, ids: number[]) => {
  logger.info("entering::getCostCentersByIds::repository::master");
  return db.costCenter.findMany({
    where: {
      id: { in: ids },
      isActive: true,
      companyId,
    },
  });
};
