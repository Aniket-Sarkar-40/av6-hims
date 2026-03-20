import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import {
  BinaryFlag,
  OpdClientMasterSetting,
  OpdMasterType,
} from "@repo/db/generated/prisma/client";

export const getAllClientPaymentSettingsFromDb = async (): Promise<
  OpdClientMasterSetting[]
> => {
  logger.info("entering::getAllClientPaymentSettingsFromDb::repository");

  const allClientPaymentSettings = await db.opdClientMasterSetting.findMany({
    where: {
      status: BinaryFlag.true,
    },
  });

  logger.info("exiting::getAllClientPaymentSettingsFromDb::repository");
  return allClientPaymentSettings;
};

export const getClientPaymentSettingsByIdFromDb = async (
  id: number,
): Promise<OpdClientMasterSetting | null> => {
  logger.info(
    `entering::getClientPaymentSettingsByIdFromDb::repository id=${id}`,
  );

  const clientPaymentSettings = await db.opdClientMasterSetting.findFirst({
    where: { id, status: BinaryFlag.true },
  });

  logger.info(
    `exiting::getClientPaymentSettingsByIdFromDb::repository id=${id}`,
  );
  return clientPaymentSettings;
};

export const getClientPaymentSettingsByFilterFromDb = async (
  clientId: number,
  locationId?: number,
  type?: OpdMasterType,
  typeId?: number,
): Promise<OpdClientMasterSetting | null> => {
  return db.opdClientMasterSetting.findFirst({
    where: { clientId, locationId, type, typeId, status: BinaryFlag.true },
  });
};

export const getClientPaymentSettingByFilterFromDb = async (
  clientId: number,
  locationId: number,
  type: OpdMasterType,
  typeId: number,
): Promise<OpdClientMasterSetting | null> => {
  return db.opdClientMasterSetting.findFirst({
    where: { clientId, locationId, type, typeId, status: BinaryFlag.true },
  });
};

export const getClientPricing = async (
  clientId: number,
  locationId: number,
): Promise<OpdClientMasterSetting | null> => {
  return db.opdClientMasterSetting.findFirst({
    where: {
      clientId,
      locationId,
      status: BinaryFlag.true,
    },
  });
};
