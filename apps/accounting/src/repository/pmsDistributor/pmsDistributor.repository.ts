import { db } from "@repo/db";
import { Distributor } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getPmsDistributorById = async (
  id: number
): Promise<Distributor | null> => {
  logger.info("entering::getPmsDistributorById::repository");
  const distributor = await db.distributor.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
  logger.info("exiting::getPmsDistributorById::repository");
  return distributor;
};
