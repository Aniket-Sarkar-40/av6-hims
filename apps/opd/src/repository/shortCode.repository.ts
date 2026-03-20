import { logger } from "@repo/platform/logging/logger.js";
import { db } from "@repo/db/client";
import { OpdDynamicShortCode } from "@repo/db/generated/prisma/client";

export const getShortCodeByCodeFromDb = async (
  code: string,
): Promise<OpdDynamicShortCode | null> => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.opdDynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};
