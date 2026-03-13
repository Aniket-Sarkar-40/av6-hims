import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getShortCodeByCodeFromDb = async (code: string) => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.coreDynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};
