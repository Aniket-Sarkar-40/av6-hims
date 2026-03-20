import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import { ClientMaster } from "@repo/db/generated/prisma/client";

export const getCorporateClientById = async (
  id: number,
): Promise<ClientMaster | null> => {
  logger.info("entering::getCorporateClientById::repository");
  return db.clientMaster.findFirst({
    where: {
      id,
      status: "active",
    },
  });
};

export const getCorporateClientByCcId = async (
  ccId: number,
): Promise<ClientMaster[]> => {
  logger.info("entering::getCorporateClientByCcId::repository");
  return db.clientMaster.findMany({
    where: {
      ccId,
      status: "active",
    },
  });
};
