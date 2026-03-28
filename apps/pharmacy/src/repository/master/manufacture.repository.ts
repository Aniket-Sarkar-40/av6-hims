import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { Manufacture } from "@repo/db/generated/prisma/client";
import { DropDownName } from "@/types/master/dropDownName.js";

export const createManufactureInDb = async (
  manufacture: DropDownName,
): Promise<Manufacture> => {
  logger.info("entering::createManufactureInDb::repository");
  const store = requestStorage.getStore();
  return db.manufacture.create({
    data: { ...manufacture, createdBy: store?.user?.id },
  });
};

export const updateManufactureInDb = async (
  manufacture: DropDownName,
): Promise<Manufacture> => {
  logger.info("entering::updateManufactureInDb::repository");
  const store = requestStorage.getStore();
  return db.manufacture.update({
    where: { id: manufacture.id },
    data: { ...manufacture, updatedBy: store?.user?.id },
  });
};

export const getManufactureByManufactureNameFromDb = async (
  name: string,
): Promise<Manufacture | null> => {
  logger.info("entering::getManufactureByManufactureNameFromDb::repository");
  return db.manufacture.findFirst({
    where: { name, isActive: true },
  });
};

export const getManufactureByIdFromDb = async (
  id: number,
): Promise<Manufacture | null> => {
  logger.info("entering::getManufactureByIdFromDb::repository");
  return db.manufacture.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllManufactureFromDb = async (): Promise<Manufacture[]> => {
  logger.info("entering::getAllManufactureFromDb::repository");
  return db.manufacture.findMany({
    where: { isActive: true },
  });
};

export const getManufactureByNameFromDb = async (
  name: string,
): Promise<Manufacture | null> => {
  logger.info("entering::getManufactureByNameFromDb::repository");
  return db.manufacture.findFirst({
    where: { name, isActive: true },
  });
};
