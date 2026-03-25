import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { WarehouseReq } from "@/types/master/warehouse.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PmsWarehouse } from "@repo/db/generated/prisma/client";
import { ToggleActive } from "av6-core";

export const createWarehouseInDb = async (
  warehouse: WarehouseReq,
): Promise<PmsWarehouse> => {
  logger.info("entering::createWarehouseInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  return db.pmsWarehouse.create({
    data: {
      ...warehouse,
      countryCode: warehouse.countryCode
        ? warehouse.countryCode
        : setting?.countryCode,
      createdBy: store?.user?.id,
    },
  });
};

export const updateWarehouseInDb = async (
  warehouse: WarehouseReq,
): Promise<PmsWarehouse> => {
  logger.info("entering::updateWarehouseInDb::repository");
  const store = requestStorage.getStore();
  return db.pmsWarehouse.update({
    where: { id: warehouse.id },
    data: { ...warehouse, updatedBy: store?.user?.id },
  });
};

export const getWarehouseByWarehouseNameFromDb = async (
  name: string,
): Promise<PmsWarehouse | null> => {
  logger.info("entering::getWarehouseByWarehouseNameFromDb::repository");
  return db.pmsWarehouse.findFirst({
    where: { name },
  });
};

export const getWarehouseByIdFromDb = async (
  id: number,
): Promise<PmsWarehouse | null> => {
  logger.info("entering::getWarehouseByIdFromDb::repository");
  return db.pmsWarehouse.findUnique({
    where: { id },
  });
};

export const getAllWarehouseFromDb = async (): Promise<PmsWarehouse[]> => {
  logger.info("entering::getAllWarehouseFromDb::repository");
  return db.pmsWarehouse.findMany({});
};

export const toggleActiveWarehouse = async (
  input: ToggleActive,
): Promise<PmsWarehouse> => {
  logger.info("entering::toggleActiveWarehouse::repository");
  const store = requestStorage.getStore();
  return db.pmsWarehouse.update({
    where: { id: input.id },
    data: {
      isActive: input.action === "ACTIVE",
      updatedBy: store?.user?.id,
    },
  });
};
