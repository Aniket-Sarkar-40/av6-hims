import { InvUnitMaster } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createUnitMasterInDb = async (
  unitMaster: UnitMasterReq,
): Promise<InvUnitMaster> => {
  logger.info("entering::createUnitMasterInDb::repository");
  const store = requestStorage.getStore();
  return db.invUnitMaster.create({
    data: {
      ...unitMaster,
      createdBy: store?.user?.id,
    },
  });
};

export const updateUnitMasterInDb = async (
  unitMaster: UnitMasterUpdate,
): Promise<InvUnitMaster> => {
  logger.info("entering::updateUnitMasterInDb::repository");
  const store = requestStorage.getStore();
  return db.invUnitMaster.update({
    where: { id: unitMaster.id },
    data: { ...unitMaster, updatedBy: store?.user?.id },
  });
};

export const getUnitMasterByUnitMasterPackNameFromDb = async (
  packagingTypeName: string,
): Promise<InvUnitMaster | null> => {
  logger.info("entering::getUnitMasterByUnitMasterNameFromDb::repository");
  return db.invUnitMaster.findFirst({
    where: { packagingTypeName, isActive: true },
  });
};

export const getUnitMasterByIdFromDb = async (
  id: number,
): Promise<InvUnitMaster | null> => {
  logger.info("entering::getUnitMasterByIdFromDb::repository");
  return db.invUnitMaster.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllUnitMasterFromDb = async (): Promise<InvUnitMaster[]> => {
  logger.info("entering::getAllUnitMasterFromDb::repository");
  return db.invUnitMaster.findMany({
    where: {
      isActive: true,
    },
  });
};
