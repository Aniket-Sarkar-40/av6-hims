import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@/types/feature/feature.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PmsFeatureFlag } from "@repo/db/generated/prisma/client";

export const createFeatureFlagInDb = async (
  input: CreateFeatureFlagInput,
): Promise<PmsFeatureFlag> => {
  logger.info("entering::createFeatureFlagInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;

  const created = await db.pmsFeatureFlag.create({
    data: {
      ...input,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    },
  });

  logger.info("exiting::createFeatureFlagInDb::repository");
  return created;
};

export const updateFeatureFlagInDb = async (
  input: UpdateFeatureFlagInput,
): Promise<PmsFeatureFlag> => {
  logger.info("entering::updateFeatureFlagInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;

  const { id, ...rest } = input;

  const updated = await db.pmsFeatureFlag.update({
    where: { id, isActive: true },
    data: {
      ...rest,
      updatedBy: currentUserId,
    },
  });

  logger.info("exiting::updateFeatureFlagInDb::repository");
  return updated;
};

export const getFeatureFlagByIdFromDb = async (
  id: number,
): Promise<PmsFeatureFlag | null> => {
  logger.info("entering::getFeatureFlagByIdFromDb::repository");
  const record = await db.pmsFeatureFlag.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
  logger.info("exiting::getFeatureFlagByIdFromDb::repository");
  return record;
};

export const getAllFeatureFlagsFromDb = async (): Promise<PmsFeatureFlag[]> => {
  logger.info("entering::getAllFeatureFlagsFromDb::repository");
  const records = await db.pmsFeatureFlag.findMany({
    where: {
      isActive: true,
    },
  });
  logger.info("exiting::getAllFeatureFlagsFromDb::repository");
  return records;
};

export const toggleFeatureFlagInDb = async (
  id: number,
  existing: PmsFeatureFlag,
): Promise<PmsFeatureFlag> => {
  logger.info("entering::toggleFeatureFlagInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;

  const updated = await db.pmsFeatureFlag.update({
    where: {
      id,
      isActive: true,
    },
    data: {
      isEnabled: !existing.isEnabled,
      updatedBy: currentUserId,
    },
  });

  logger.info("exiting::toggleFeatureFlagInDb::repository");
  return updated;
};

export const deleteFeatureFlagFromDb = async (id: number): Promise<boolean> => {
  logger.info("entering::deleteFeatureFlagFromDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;
  await db.pmsFeatureFlag.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedBy: currentUserId,
      deletedAt: new Date(),
    },
  });
  logger.info("exiting::deleteFeatureFlagFromDb::repository");
  return true;
};

export const getFeatureFlagByShortCodeFromDb = async (
  shortCode: string,
): Promise<PmsFeatureFlag | null> => {
  logger.info("entering::getFeatureFlagByShortCodeFromDb::repository");
  const record = await db.pmsFeatureFlag.findFirst({
    where: {
      shortCode,
      isActive: true,
    },
  });
  logger.info("exiting::getFeatureFlagByShortCodeFromDb::repository");
  return record;
};
