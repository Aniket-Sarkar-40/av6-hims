import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { MedCategory } from "@repo/db/generated/prisma/client";
import { MedCategoryInput } from "@/types/master/medCategory.js";

export const createMedCategoryInDb = async (
  medCategory: MedCategoryInput,
): Promise<MedCategory> => {
  logger.info("entering::createMedCategoryInDb::repository");
  const store = requestStorage.getStore();
  return db.medCategory.create({
    data: { ...medCategory, createdBy: store?.user?.id },
  });
};

export const updateMedCategoryInDb = async (
  medCategory: MedCategoryInput,
): Promise<MedCategory> => {
  logger.info("entering::updateMedCategoryInDb::repository");
  const store = requestStorage.getStore();
  return db.medCategory.update({
    where: { id: medCategory.id },
    data: { ...medCategory, updatedBy: store?.user?.id },
  });
};

export const getMedCategoryByMedCategoryNameFromDb = async (
  name: string,
): Promise<MedCategory | null> => {
  logger.info("entering::getMedCategoryByMedCategoryNameFromDb::repository");
  return db.medCategory.findFirst({
    where: { name, isActive: true },
  });
};

export const getMedCategoryByIdFromDb = async (
  id: number,
): Promise<MedCategory | null> => {
  logger.info("entering::getMedCategoryByIdFromDb::repository");
  return db.medCategory.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllMedCategoryFromDb = async (): Promise<MedCategory[]> => {
  logger.info("entering::getAllMedCategoryFromDb::repository");
  return db.medCategory.findMany({
    where: { isActive: true },
  });
};

export const getCountMedCategoriesFromDb = async (categoryIds: number[]) => {
  return db.medCategory.findMany({
    where: {
      id: { in: categoryIds },
      isActive: true,
    },
    select: { id: true },
  });
};
