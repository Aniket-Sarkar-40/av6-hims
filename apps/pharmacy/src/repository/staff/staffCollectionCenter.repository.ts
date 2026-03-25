import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { db } from "@repo/db";
import { CreateOrUpdateStaffCollectionCenter } from "@/types/staff/staffCollectionCenter.js";
import { logger } from "@repo/platform/logging/logger.js";
import { StaffCollectionCenter } from "@repo/db/generated/prisma/client";

export async function createStaffCollectionCenterInDb(
  input: CreateOrUpdateStaffCollectionCenter,
): Promise<StaffCollectionCenter> {
  logger.info("entering::createStaffCollectionCenterInDb::repository");

  const staffCollectionCenter = await db.staffCollectionCenter.create({
    data: {
      staffId: input.staffId,
      collectionCenterId: input.collectionCenterId,
      isMainLab: input.isMainLab,
      isActive: input.isActive,
    },
  });

  logger.info("exiting::createStaffCollectionCenterInDb::repository");

  return staffCollectionCenter;
}

export async function updateStaffCollectionCenterInDb(
  id: number,
  input: CreateOrUpdateStaffCollectionCenter,
): Promise<StaffCollectionCenter> {
  logger.info("entering::updateStaffCollectionCenterInDb::repository");

  const updatedStaffCollectionCenter = await db.staffCollectionCenter.update({
    where: { id },
    data: {
      staffId: input.staffId,
      collectionCenterId: input.collectionCenterId,
      isMainLab: input.isMainLab,
      isActive: input.isActive,
    },
  });

  logger.info("exiting::updateStaffCollectionCenterInDb::repository");
  return updatedStaffCollectionCenter;
}

export const getStaffCollectionCenterByIdFromDb = async (id: number) => {
  logger.info("entering::getStaffCollectionCenterByIdFromDb::repository");
  return db.staffCollectionCenter.findUnique({
    where: { id, isActive: "true" },
  });
};

export const getStaffCollectionCenterMappingsFromDb = async (
  staffId: number,
) => {
  logger.info("entering::getStaffCollectionCenterMappingsFromDb::repository");

  const collectionCenters = await db.staffCollectionCenter.findMany({
    where: { staffId, isActive: "true" },
    select: { collectionCenterId: true },
  });

  return collectionCenters.map((center) => center.collectionCenterId);
};

export const deleteStaffCollectionCenterInDb = async (
  id: number,
): Promise<void> => {
  logger.info("entering::deleteStaffCollectionCenterInDb::repository");

  await db.$transaction(
    async (tx) => {
      await tx.staff.update({
        where: { id },
        data: { isActive: 0 },
      });
      await tx.staffMapping.update({
        where: {
          staffId: id,
        },
        data: {
          isActive: false,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};
