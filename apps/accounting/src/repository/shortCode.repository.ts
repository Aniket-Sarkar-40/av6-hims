import { db } from "@repo/db";
import { AccDynamicShortCode } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getShortCodeByCodeFromDb = async (
  code: string
): Promise<AccDynamicShortCode | null> => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.accDynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};
