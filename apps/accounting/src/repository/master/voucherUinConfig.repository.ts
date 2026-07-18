import { requestStorage } from "@/config/requestContext.js";
import { CreateOrUpdateVoucherUINConfigRequest } from "@/types/master/voucherUinConfig.js";
import { db } from "@repo/db/client";
import { VoucherUINConfig } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const createVoucherUINConfigInDb = async (
  voucherUINConfig: CreateOrUpdateVoucherUINConfigRequest
) => {
  logger.info("entering::createVoucherUINConfigInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  //   const { uinSegments, ...voucherUINConfigData } = voucherUINConfig;
  const omittedData = customOmit<
    CreateOrUpdateVoucherUINConfigRequest,
    "uinSegments" | "id"
  >(voucherUINConfig, ["uinSegments", "id"]);
  return db.voucherUINConfig.create({
    data: {
      ...omittedData.rest,
      uinSegments: JSON.stringify(voucherUINConfig.uinSegments),
      createdBy: currentUser,
    },
  });
};

export async function updateVoucherUINConfig(
  updatedConfig: CreateOrUpdateVoucherUINConfigRequest,
  prevConfig: VoucherUINConfig
): Promise<VoucherUINConfig> {
  logger.info("entering::updateUINConfig::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const updated = await db.voucherUINConfig.update({
    where: { id: updatedConfig.id },
    data: {
      voucherTypeId: updatedConfig.voucherTypeId,
      seqStartDate: updatedConfig.seqStartDate,
      seqResetPolicy: updatedConfig.seqResetPolicy,
      description: updatedConfig.description ?? null,
      uinSegments: JSON.stringify(updatedConfig.uinSegments),
      sequenceNo: prevConfig.sequenceNo,
      seqResetDate: updatedConfig.seqResetDate,
      updatedBy: currentUser,
    },
  });
  return updated;
}

export const getVoucherUINConfigByVoucherTypeIdAndDate = async (
  voucherTypeId: number,
  date: Date
): Promise<VoucherUINConfig | null> => {
  logger.info("entering::getVoucherUINConfigByVoucherTypeId::repository");
  return db.voucherUINConfig.findFirst({
    where: {
      voucherTypeId,
      isActive: true,
      seqStartDate: { lte: date },
      seqResetDate: { gte: date },
    },
  });
};

export const updateVoucherUINConfigSequenceNo = async (
  id: number,
  next: bigint
): Promise<void> => {
  logger.info("entering::updateVoucherUINConfigSequenceNo::repository");
  await db.voucherUINConfig.update({
    where: { id, isActive: true },
    data: { sequenceNo: next },
  });
};

export const updateVoucherUINConfigSequenceNoAndResetDate = async (
  id: number,
  next: bigint,
  resetDate: Date
) => {
  logger.info(
    "entering::updateVoucherUINConfigSequenceNoAndResetDate::repository"
  );
  await db.voucherUINConfig.update({
    where: { id },
    data: {
      sequenceNo: next,
      seqResetDate: resetDate,
    },
  });
};

export const deleteVoucherUINConfigById = async (id: number): Promise<void> => {
  logger.info("entering::deleteVoucherUINConfigById::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  await db.voucherUINConfig.update({
    where: { id },
    data: {
      isActive: false,
      updatedBy: currentUser,
      deletedAt: new Date(),
      deletedBy: currentUser,
    },
  });
};

export const checkForNextVoucherUINConfigExists = async (
  id: number,
  voucherTypeId: number,
  resetDate: Date
) => {
  logger.info("entering::checkForNextVoucherUINConfigExists::repository");
  return db.voucherUINConfig.findMany({
    where: {
      voucherTypeId,
      isActive: true,
      seqStartDate: { lte: resetDate },
      NOT: { id },
    },
    orderBy: {
      seqResetDate: "asc",
    },
  });
};

export const checkOverlapAndFutureVoucherUINConfig = async (
  id: number,
  voucherTypeId: number,
  seqStartDate: Date,
  seqResetDate: Date
) => {
  logger.info("entering::checkOverlapAndFutureVoucherUINConfig::repository");

  return db.voucherUINConfig.findMany({
    where: {
      voucherTypeId,
      isActive: true,
      NOT: {
        id,
      },
      OR: [
        {
          AND: [
            {
              seqStartDate: {
                lte: seqResetDate,
              },
            },
            {
              seqResetDate: {
                gt: seqStartDate,
              },
            },
          ],
        },
        {
          seqStartDate: {
            gt: seqResetDate,
          },
        },
      ],
    },
    orderBy: {
      seqStartDate: "asc",
    },
    take: 1,
  });
};
