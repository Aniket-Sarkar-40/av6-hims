import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BoxSize } from "@repo/db/generated/prisma/client";

export const createBoxSizeInDb = async (
  boxSize: DropDownName,
): Promise<BoxSize> => {
  logger.info("entering::createBoxSizeInDb::repository");
  const store = requestStorage.getStore();
  return db.boxSize.create({
    data: { ...boxSize, createdBy: store?.user?.id },
  });
};

export const updateBoxSizeInDb = async (
  boxSize: DropDownName,
): Promise<BoxSize> => {
  logger.info("entering::updateBoxSizeInDb::repository");
  const store = requestStorage.getStore();
  return db.boxSize.update({
    where: { id: boxSize.id },
    data: { ...boxSize, updatedBy: store?.user?.id },
  });
};

export const getBoxSizeByBoxSizeNameFromDb = async (
  name: string,
): Promise<BoxSize | null> => {
  logger.info("entering::getBoxSizeByBoxSizeNameFromDb::repository");
  return db.boxSize.findFirst({
    where: { name, isActive: true },
  });
};

export const getBoxSizeByIdFromDb = async (
  id: number,
): Promise<BoxSize | null> => {
  logger.info("entering::getBoxSizeByIdFromDb::repository");
  return db.boxSize.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllBoxSizeFromDb = async (): Promise<BoxSize[]> => {
  logger.info("entering::getAllBoxSizeFromDb::repository");
  return db.boxSize.findMany({
    where: { isActive: true },
  });
};
