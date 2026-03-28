import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@/types/feature/feature.js";
import { logger } from "@repo/platform/logging/logger.js";
import { FeatureFlag } from "@repo/db/generated/prisma/client";

export const createFeatureFlagInDb = async (
  input: CreateFeatureFlagInput,
): Promise<FeatureFlag> => {
  logger.info("entering::createFeatureFlagInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;

  const created = await db.featureFlag.create({
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
): Promise<FeatureFlag> => {
  logger.info("entering::updateFeatureFlagInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;

  const { id, ...rest } = input;

  const updated = await db.featureFlag.update({
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
): Promise<FeatureFlag | null> => {
  logger.info("entering::getFeatureFlagByIdFromDb::repository");
  const record = await db.featureFlag.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
  logger.info("exiting::getFeatureFlagByIdFromDb::repository");
  return record;
};

export const getAllFeatureFlagsFromDb = async (): Promise<FeatureFlag[]> => {
  logger.info("entering::getAllFeatureFlagsFromDb::repository");
  const records = await db.featureFlag.findMany({
    where: {
      isActive: true,
    },
  });
  logger.info("exiting::getAllFeatureFlagsFromDb::repository");
  return records;
};

export const toggleFeatureFlagInDb = async (
  id: number,
  existing: FeatureFlag,
): Promise<FeatureFlag> => {
  logger.info("entering::toggleFeatureFlagInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;

  const updated = await db.featureFlag.update({
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
  await db.featureFlag.update({
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
): Promise<FeatureFlag | null> => {
  logger.info("entering::getFeatureFlagByShortCodeFromDb::repository");
  const record = await db.featureFlag.findFirst({
    where: {
      shortCode,
      isActive: true,
    },
  });
  logger.info("exiting::getFeatureFlagByShortCodeFromDb::repository");
  return record;
};
