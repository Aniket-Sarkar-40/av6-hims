import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";
import { InsurerPaymentSettings } from "@repo/db/generated/prisma/client";

export const getAllInsurancePaymentSettingsFromDb = async (): Promise<
  InsurerPaymentSettings[]
> => {
  logger.info("entering::getAllInsurancePaymentSettingsFromDb::repository");

  const allInsurancePaymentSettings = await db.insurerPaymentSettings.findMany(
    {},
  );

  logger.info("exiting::getAllInsurancePaymentSettingsFromDb::repository");
  return allInsurancePaymentSettings;
};

export const getInsurancePaymentSettingsByIdFromDb = async (
  id: number,
): Promise<InsurerPaymentSettings | null> => {
  logger.info(
    `entering::getInsurancePaymentSettingsByIdFromDb::repository id=${id}`,
  );

  const insurancePaymentSettings = await db.insurerPaymentSettings.findFirst({
    where: { id },
  });

  logger.info(
    `exiting::getInsurancePaymentSettingsByIdFromDb::repository id=${id}`,
  );
  return insurancePaymentSettings;
};

// export const getInsurancePaymentSettingsByFilterFromDb = async (
//   insuranceId?: number | "all",
//   ccId?: number | "all",
//   medId?: number
// ): Promise<InsurerPaymentSettings[]> => {
//   return db.insurerPaymentSettings.findMany({
//     where: {
//       status: true,
//       ...(insuranceId !== undefined && insuranceId !== "all" && { insuranceId }),
//       ...(ccId !== undefined && ccId !== "all" && { ccId }),
//       ...(medId !== undefined && { medId }),
//     },
//   });
// };

export const getInsurancePaymentSettingsByFilterFromDb = async (
  insuranceId: number | "all" = "all",
  ccId: number | "all" = "all",
  medId: number | null = null,
): Promise<InsurerPaymentSettings[]> => {
  const where: Record<string, unknown> = { status: true };

  if (insuranceId !== "all") where.insuranceId = insuranceId;
  if (ccId !== "all") where.ccId = ccId;
  if (medId !== null) where.medId = medId;

  return db.insurerPaymentSettings.findMany({ where });
};

export const getInsurancePricing = async (
  insuranceId: number,
  ccId: number,
  medId: number,
): Promise<InsurerPaymentSettings | null> => {
  return db.insurerPaymentSettings.findFirst({
    where: {
      insuranceId,
      medId,
      ccId,
      status: true,
    },
  });
};
