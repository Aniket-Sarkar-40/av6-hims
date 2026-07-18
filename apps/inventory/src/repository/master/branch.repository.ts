import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { ToggleActive } from "@/types/common.js";
import { BranchReq } from "@/types/master/branch.js";
import { logger } from "@repo/platform/logging/logger.js";
import { InvBranch, CollectionCenter } from "@repo/db/generated/prisma/client";
export const createBranchInDb = async (branch: BranchReq) => {
  logger.info("entering::createBranchInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;

  return db.$transaction(async (tx) => {
    if (branch.isMain) {
      await tx.invBranch.updateMany({
        where: {
          isMain: true,
          isActive: true,
        },
        data: {
          isMain: false,
          updatedBy: store?.user?.id,
        },
      });
    }

    const createdBranch = await tx.invBranch.create({
      data: {
        ...branch,
        countryCode: branch.countryCode
          ? branch.countryCode
          : setting?.countryCode,
        createdBy: store?.user?.id,
      },
      include: {
        collectionCenter: true,
      },
    });

    return createdBranch;
  });
};

export const updateBranchInDb = async (branch: BranchReq) => {
  logger.info("entering::updateBranchInDb::repository");
  const store = requestStorage.getStore();

  return db.$transaction(async (tx) => {
    if (branch.isMain) {
      await tx.invBranch.updateMany({
        where: {
          isMain: true,
          id: {
            not: branch.id,
          },
        },
        data: {
          isMain: false,
          updatedBy: store?.user?.id,
        },
      });
    }

    const updatedBranch = await tx.invBranch.update({
      where: { id: branch.id },
      data: {
        ...branch,
        updatedBy: store?.user?.id,
      },
      include: {
        collectionCenter: true,
      },
    });

    return updatedBranch;
  });
};

export const getBranchByBranchNameFromDb = async (
  name: string,
): Promise<InvBranch | null> => {
  logger.info("entering::getBranchByBranchNameFromDb::repository");
  return db.invBranch.findFirst({
    where: { name },
  });
};

export const getBranchByIdFromDb = async (id: number) => {
  logger.info("entering::getBranchByIdFromDb::repository");
  return db.invBranch.findUnique({
    where: { id, isActive: true },
    include: {
      collectionCenter: true,
    },
  });
};

export const getAllBranchFromDb = async () => {
  logger.info("entering::getAllBranchFromDb::repository");
  return db.invBranch.findMany({
    where: {
      isActive: true,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const toggleActiveBranch = async (input: ToggleActive) => {
  logger.info("entering::toggleActiveBranch::repository");
  const store = requestStorage.getStore();
  return db.invBranch.update({
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

export const getBranchesByCcIdsFromDb = async (ccIds: number[]) => {
  logger.info("entering::getBranchesByCcIdsFromDb::repository");
  if (!ccIds.length) return [];
  return db.invBranch.findMany({
    where: {
      isActive: true,
      id: { in: ccIds },
    },
    include: { collectionCenter: true },
  });
};

export const getCollectionCenterByIdFromDb = async (
  id: number,
): Promise<CollectionCenter | null> => {
  logger.info("entering::getCollectionCenterByIdFromDb::repository");
  return db.collectionCenter.findUnique({
    where: { id, isActive: "true" },
  });
};
