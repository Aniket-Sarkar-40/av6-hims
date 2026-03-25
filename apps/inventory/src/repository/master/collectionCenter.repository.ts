import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getCollectionCenterByIdFromDb = async (id: number) => {
  logger.info("entering::getCollectionCenterByIdFromDb::repository");
  return db.collectionCenter.findUnique({
    where: { id, isActive: "true" },
  });
};
