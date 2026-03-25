import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { ToggleActive } from "@/types/common.js";
import { WarehouseReq } from "@/types/master/warehouse.js";
import { logger } from "@repo/platform/logging/logger.js";
import { InvWarehouse } from "@repo/db/generated/prisma/client";

export const createWarehouseInDb = async (warehouse: WarehouseReq) => {
  logger.info("entering::createWarehouseInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  return db.invWarehouse.create({
    data: {
      ...warehouse,
      countryCode: warehouse.countryCode
        ? warehouse.countryCode
        : setting?.countryCode,
      createdBy: store?.user?.id,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const updateWarehouseInDb = async (warehouse: WarehouseReq) => {
  logger.info("entering::updateWarehouseInDb::repository");
  const store = requestStorage.getStore();
  return db.invWarehouse.update({
    where: { id: warehouse.id },
    data: { ...warehouse, updatedBy: store?.user?.id },
    include: {
      collectionCenter: true,
    },
  });
};

export const getWarehouseByWarehouseNameFromDb = async (
  name: string,
): Promise<InvWarehouse | null> => {
  logger.info("entering::getWarehouseByWarehouseNameFromDb::repository");
  return db.invWarehouse.findFirst({
    where: { name },
  });
};

export const getWarehouseByIdFromDb = async (id: number) => {
  logger.info("entering::getWarehouseByIdFromDb::repository");
  return db.invWarehouse.findUnique({
    where: { id, isActive: true },
    include: {
      collectionCenter: true,
    },
  });
};

export const getAllWarehouseFromDb = async () => {
  logger.info("entering::getAllWarehouseFromDb::repository");
  return db.invWarehouse.findMany({
    where: {
      isActive: true,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const toggleActiveWarehouse = async (input: ToggleActive) => {
  logger.info("entering::toggleActiveWarehouse::repository");
  const store = requestStorage.getStore();
  return db.invWarehouse.update({
    where: { id: input.id },
    data: {
      isActive: input.action === "ACTIVE",
      updatedBy: store?.user?.id,
    },
    include: {
      collectionCenter: true,
    },
  });
};

// warehouse.repository.ts
export const getWarehousesByCcIdsFromDb = async (ccIds: number[]) => {
  logger.info("entering::getWarehousesByCcIdsFromDb::repository");
  if (!ccIds.length) return [];
  return db.invWarehouse.findMany({
    where: {
      isActive: true,
      id: { in: ccIds }, // <-- key part
    },
    include: { collectionCenter: true },
  });
};
