import { DefaultUnitMasterReq } from "@/types/master/defaultUnitMaster.js";
import { db } from "@repo/db/client";
import { InvDefaultUnitMaster } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createDefaultUnitMasterInDb = async (
  defaultUnitMaster: DefaultUnitMasterReq,
): Promise<InvDefaultUnitMaster> => {
  logger.info("entering::createDefaultUnitMasterInDb::repository");
  const store = requestStorage.getStore();
  return db.invDefaultUnitMaster.create({
    data: {
      ...defaultUnitMaster,
      createdBy: store?.user?.id,
    },
  });
};

export const updateDefaultUnitMasterInDb = async (
  defaultUnitMaster: DefaultUnitMasterReq,
): Promise<InvDefaultUnitMaster> => {
  logger.info("entering::updateDefaultUnitMasterInDb::repository");
  const store = requestStorage.getStore();
  return db.invDefaultUnitMaster.update({
    where: { id: defaultUnitMaster.id },
    data: { ...defaultUnitMaster, updatedBy: store?.user?.id },
  });
};

export const getDefaultUnitMasterByNameFromDb = async (
  name: string,
): Promise<InvDefaultUnitMaster | null> => {
  logger.info("entering::getDefaultUnitMasterByNameFromDb::repository");
  return db.invDefaultUnitMaster.findFirst({
    where: { name, isActive: true },
  });
};

export const getDefaultUnitMasterByIdFromDb = async (
  id: number,
): Promise<InvDefaultUnitMaster | null> => {
  logger.info("entering::getDefaultUnitMasterByIdFromDb::repository");
  return db.invDefaultUnitMaster.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllDefaultUnitMasterFromDb = async (): Promise<
  InvDefaultUnitMaster[]
> => {
  logger.info("entering::getAllDefaultUnitMasterFromDb::repository");
  return db.invDefaultUnitMaster.findMany({
    where: {
      isActive: true,
    },
  });
};
