import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import {
  BinaryFlag,
  OpdInsurerPaymentSetting,
  OpdMasterType,
} from "@repo/db/generated/prisma/client";

export const getAllInsurancePaymentSettingsFromDb = async (): Promise<
  OpdInsurerPaymentSetting[]
> => {
  logger.info("entering::getAllInsurancePaymentSettingsFromDb::repository");

  const allInsurancePaymentSettings =
    await db.opdInsurerPaymentSetting.findMany({
      where: {
        status: BinaryFlag.true,
      },
    });

  logger.info("exiting::getAllInsurancePaymentSettingsFromDb::repository");
  return allInsurancePaymentSettings;
};

export const getInsurancePaymentSettingsByIdFromDb = async (
  id: number,
): Promise<OpdInsurerPaymentSetting | null> => {
  logger.info(
    `entering::getInsurancePaymentSettingsByIdFromDb::repository id=${id}`,
  );

  const insurancePaymentSettings = await db.opdInsurerPaymentSetting.findFirst({
    where: { id, status: BinaryFlag.true },
  });

  logger.info(
    `exiting::getInsurancePaymentSettingsByIdFromDb::repository id=${id}`,
  );
  return insurancePaymentSettings;
};

export const getInsurancePaymentSettingsByFilterFromDb = async (
  insurerId: number,
  locationId: number,
  type: OpdMasterType,
  typeId: number,
): Promise<OpdInsurerPaymentSetting | null> => {
  return db.opdInsurerPaymentSetting.findFirst({
    where: { insurerId, locationId, type, typeId, status: BinaryFlag.true },
  });
};

export const getInsurancePricing = async (
  insurerId: number,
  locationId: number,
): Promise<OpdInsurerPaymentSetting | null> => {
  return db.opdInsurerPaymentSetting.findFirst({
    where: {
      insurerId,
      locationId,
      status: BinaryFlag.true,
    },
  });
};

export const getInsurancePaymentSettingByFilterFromDb = async (
  insurerId: number,
  locationId: number,
  type: OpdMasterType,
  typeId: number,
): Promise<OpdInsurerPaymentSetting | null> => {
  return db.opdInsurerPaymentSetting.findFirst({
    where: { insurerId, locationId, type, typeId, status: BinaryFlag.true },
  });
};
