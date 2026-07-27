import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import { CoreApprovalService } from "@repo/db/generated/prisma/client";

export const getCoreServiceByNameFromDb = async (
  name: string,
): Promise<CoreApprovalService | null> => {
  logger.info("entering::getCurrencyByCurrencyName::repository");
  return db.coreApprovalService.findFirst({
    where: { name: name },
  });
};
