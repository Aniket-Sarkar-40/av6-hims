import { logger } from "@repo/platform/logging/logger.js";
import { InvDynamicShortCode } from "@repo/db/generated/prisma/client";
import { db } from "@repo/db";

export const getShortCodeByCodeFromDb = async (
  code: string,
): Promise<InvDynamicShortCode | null> => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.invDynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};
