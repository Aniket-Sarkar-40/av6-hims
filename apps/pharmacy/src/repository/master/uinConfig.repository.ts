import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateUINConfigRequest,
  UpdateUINConfigRequest,
} from "@/types/master/uinConfig.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PmsUINConfig,
  PmsUinShortCode,
} from "@repo/db/generated/prisma/client";

export const createUINConfigInDb = async (uinReq: CreateUINConfigRequest) => {
  logger.info("entering::createUINConfigInDb::repository");
  const storage = requestStorage.getStore();
  const { uinSegments, ...uinData } = uinReq;
  return db.pmsUINConfig.create({
    data: {
      ...uinData,
      uinSegments: JSON.stringify(uinSegments),
      createdBy: storage?.user?.id,
      seqResetDate: new Date(),
    },
  });
};

export async function updateUINConfig(
  updatedConfig: UpdateUINConfigRequest,
  prevConfig: PmsUINConfig,
): Promise<PmsUINConfig> {
  logger.info("entering::updateUINConfig::repository");
  const storage = requestStorage.getStore();
  const updated = await db.pmsUINConfig.update({
    where: { id: updatedConfig.id },
    data: {
      shortCode: updatedConfig.shortCode,
      seqResetPolicy: updatedConfig.seqResetPolicy,
      description: updatedConfig.description ?? null,
      uinSegments: JSON.stringify(updatedConfig.uinSegments),
      sequenceNo: prevConfig.sequenceNo,
      seqResetDate: prevConfig.seqResetDate,
      updatedBy: storage?.user?.id,
    },
  });
  return updated;
}

export const getUINConfigByIdFromDb = async (
  id: number,
): Promise<PmsUINConfig | null> => {
  logger.info("entering::getUINConfigByIdFromDb::repository");
  return db.pmsUINConfig.findUnique({
    where: { id, isActive: true },
  });
};

export const getUINConfigByShortCodeFromDb = async (
  shortCode: PmsUinShortCode,
): Promise<PmsUINConfig | null> => {
  logger.info("entering::getUINConfigByShortCodeFromDb::repository");
  return db.pmsUINConfig.findFirst({
    where: { shortCode, isActive: true },
  });
};

export const getAllUINConfigFromDb = async (): Promise<PmsUINConfig[]> => {
  logger.info("entering::getAllUINConfigFromDb::repository");
  return db.pmsUINConfig.findMany({
    where: { isActive: true },
  });
};

export const updateSequenceNo = async (
  shortCode: PmsUinShortCode,
  next: bigint,
): Promise<void> => {
  logger.info("entering::updateSequenceNo::repository");
  await db.pmsUINConfig.updateMany({
    where: { shortCode, isActive: true },
    data: { sequenceNo: next },
  });
};

export const updateSequenceNoAndResetDate = async (
  shortCode: PmsUinShortCode,
  next: bigint,
  resetDate: Date,
): Promise<void> => {
  logger.info("entering::updateSequenceNo::repository");
  await db.pmsUINConfig.updateMany({
    where: { shortCode },
    data: { sequenceNo: next, seqResetDate: resetDate },
  });
};

export const deleteUINConfigById = async (id: number): Promise<void> => {
  logger.info("entering::deleteUINConfigById::repository");
  const storage = requestStorage.getStore();
  await db.pmsUINConfig.update({
    where: { id },
    data: {
      isActive: false,
      updatedBy: storage?.user?.id,
      deletedAt: new Date(),
      deletedBy: storage?.user?.id,
    },
  });
};
