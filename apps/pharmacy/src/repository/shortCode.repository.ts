import { logger } from "@repo/platform/logging/logger.js";
import { db } from "@repo/db";
import { PmsDynamicShortCode } from "@repo/db/generated/prisma/client";

export const getShortCodeByCodeFromDb = async (
  code: string
): Promise<PmsDynamicShortCode | null> => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.pmsDynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};
