import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import { PathologyMaster } from "@repo/db/generated/prisma/client";

export const getPathologyMasterByIdFromDb = async (
  id: number,
): Promise<PathologyMaster | null> => {
  logger.info("entering::getPathologyMasterByIdFromDb::repository");
  return db.pathologyMaster.findFirst({
    where: {
      id,
      standardCharge: { gt: 0 },
      orderable: "Yes",
      isActive: "Yes",
    },
  });
};

export const getPathologyMasterByTestCodeFromDb = async (
  analytecode: string,
): Promise<PathologyMaster | null> => {
  logger.info("entering::getPathologyMasterByTestCodeFromDb::repository");
  return db.pathologyMaster.findFirst({
    where: {
      analytecode,
      standardCharge: { gt: 0 },
      orderable: "Yes",
      isActive: "Yes",
    },
  });
};
