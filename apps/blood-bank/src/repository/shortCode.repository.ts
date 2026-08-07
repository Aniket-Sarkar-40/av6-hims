import { logger } from "@repo/platform/logging/logger.js";
import { db } from "@repo/db/client";
import { BloodBankDynamicShortCode } from "@repo/db/generated/prisma/client";

export const getShortCodeByCodeFromDb = async (
  code: string,
): Promise<BloodBankDynamicShortCode | null> => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.bloodBankDynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};
