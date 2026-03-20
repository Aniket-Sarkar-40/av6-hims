import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import { ICDTen } from "@repo/db/generated/prisma/client";

export const getICDTenIdFromDb = async (id: number): Promise<ICDTen | null> => {
  logger.info("entering::getICDTenIdFromDb::repository");
  return db.iCDTen.findFirst({
    where: { id },
  });
};
