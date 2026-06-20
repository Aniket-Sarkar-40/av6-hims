import { db } from "@repo/db";
import { InsuranceMaster } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getInsuranceByIdFromDb = async (
  id: number
): Promise<InsuranceMaster | null> => {
  logger.info("entering::getInsuranceByIdFromDb::repository");

  const insurance = await db.insuranceMaster.findFirst({
    where: {
      id,
      status: "active",
    },
  });

  logger.info("exiting::getInsuranceByIdFromDb::repository");
  return insurance;
};
