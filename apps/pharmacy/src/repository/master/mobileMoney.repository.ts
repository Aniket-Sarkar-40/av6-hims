import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";
import { MobileMoneyMethod } from "@repo/db/generated/prisma/client";

export const getMobileMoneyMethodByIdFromDb = async (
  id: number,
): Promise<MobileMoneyMethod | null> => {
  logger.info("entering::getMobileMoneyMethodByIdFromDb::repository");
  return db.mobileMoneyMethod.findFirst({
    where: { id },
  });
};
