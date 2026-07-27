import { db } from "@repo/db";
import { ClientMaster } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getCorporateByIdFromDb = async (
  id: number,
): Promise<ClientMaster | null> => {
  logger.info("entering::getCorporateByIdFromDb::repository");
  const corporate = await db.clientMaster.findFirst({
    where: {
      id,
      status: "active",
    },
  });
  logger.info("exiting::getCorporateByIdFromDb::repository");
  return corporate;
};
