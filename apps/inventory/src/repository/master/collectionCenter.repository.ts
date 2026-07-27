import { db } from "@repo/db/client";
import { StaffCollectionCenter } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getCollectionCenterByIdFromDb = async (id: number) => {
  logger.info("entering::getCollectionCenterByIdFromDb::repository");
  return db.collectionCenter.findUnique({
    where: { id, isActive: "true" },
  });
};

export const getStaffCollectionCenterFromDb = async (
  staffId: number,
  ccId: number,
): Promise<StaffCollectionCenter | null> => {
  logger.info(`entering::getStaffCollectionCenterFromDb::repository`);
  const staffCollectionCenter = await db.staffCollectionCenter.findFirst({
    where: { staffId, collectionCenterId: ccId, isActive: "true" },
  });
  logger.info(`exiting::getStaffCollectionCenterFromDb::repository`);
  return staffCollectionCenter;
};
