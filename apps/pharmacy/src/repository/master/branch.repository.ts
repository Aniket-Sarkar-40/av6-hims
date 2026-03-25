import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { BranchReq } from "@/types/master/branch.js";
import { customOmit, ToggleActive } from "av6-core";
import { logger } from "@repo/platform/logging/logger.js";
import { PmsBranch } from "@repo/db/generated/prisma/client";

export const createBranchInDb = async (
  branch: BranchReq,
): Promise<PmsBranch> => {
  logger.info("entering::createBranchInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const omittedBranch = customOmit<BranchReq, "categories">(branch, [
    "categories",
  ]);
  return await db.$transaction(async (tx) => {
    const createdBranch = await tx.pmsBranch.create({
      data: {
        ...omittedBranch.rest,
        countryCode: branch.countryCode
          ? branch.countryCode
          : setting?.countryCode,
        createdBy: store?.user?.id,
        branchCategoryMap: branch.categories
          ? {
              create: branch.categories.map((cat) => ({
                categoryId: cat,
                createdBy: store?.user?.id,
              })),
            }
          : undefined,
      },
    });
    return createdBranch;
  });
};

export const updateBranchInDb = async (
  branch: BranchReq,
): Promise<PmsBranch> => {
  logger.info("entering::updateBranchInDb::repository");
  const store = requestStorage.getStore();
  const omittedBranch = customOmit<BranchReq, "categories">(branch, [
    "categories",
  ]);
  return db.$transaction(
    async (tx) => {
      const updatedBranch = await tx.pmsBranch.update({
        where: { id: branch.id },
        data: {
          ...omittedBranch.rest,
          updatedBy: store?.user?.id,
          branchCategoryMap: branch.categories
            ? {
                updateMany: {
                  where: { branchId: branch.id, isActive: true },
                  data: { isActive: false, deletedBy: store?.user?.id },
                },
                create: branch.categories.map((cat) => ({
                  categoryId: cat,
                  createdBy: store?.user?.id,
                })),
              }
            : undefined,
        },
      });
      return updatedBranch;
    },
    { timeout: API_TIMEOUT },
  );
};

export const getBranchByBranchNameFromDb = async (
  name: string,
): Promise<PmsBranch | null> => {
  logger.info("entering::getBranchByBranchNameFromDb::repository");
  return db.pmsBranch.findFirst({
    where: { name },
  });
};

export const getBranchByIdFromDb = async (
  id: number,
): Promise<PmsBranch | null> => {
  logger.info("entering::getBranchByIdFromDb::repository");
  return db.pmsBranch.findUnique({
    where: { id },
  });
};

export const getAllBranchFromDb = async (): Promise<PmsBranch[]> => {
  logger.info("entering::getAllBranchFromDb::repository");
  return db.pmsBranch.findMany({
    where: { isActive: true },
  });
};

export const toggleActiveBranch = async (
  input: ToggleActive,
): Promise<PmsBranch> => {
  logger.info("entering::toggleActiveBranch::repository");
  const store = requestStorage.getStore();
  return db.pmsBranch.update({
    where: { id: input.id },
    data: {
      isActive: input.action === "ACTIVE",
      updatedBy: store?.user?.id,
    },
  });
};

export const getAllBranchIdOfItemBranchMapFromDb = async () => {
  logger.info("entering::getAllBranchIdOfItemBranchMapFromDb::repository");
  const results = await db.branchItemMap.findMany({
    where: {
      isActive: true,
    },
    distinct: ["branchId"],
    select: {
      branchId: true,
    },
  });
  return results.map((item) => item.branchId);
};

export const getBranchCategoryMapByBranchIdFromDb = async (
  branchId: number,
) => {
  logger.info("entering::getBranchCategoryMapByBranchIdFromDb::repository");
  const results = await db.branchCategoryMap.findMany({
    where: {
      branchId,
      isActive: true,
    },
    select: {
      categoryId: true,
    },
  });
  return results.map((d) => d.categoryId);
};

export const getCountBranchesFromDb = async (branchIds: number[]) => {
  logger.info("entering::getCountBranchesFromDb::repository");
  return db.pmsBranch.findMany({
    where: {
      id: { in: branchIds },
      isActive: true,
    },
  });
};
