import { requestStorage } from "@/config/requestContext.js";
import { CreateOrUpdateSettings } from "@/types/settings/settings.js";
import { db } from "@repo/db";
import { AccSettings, CompanySettings } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const upsertSettingsInDb = async (
  data: CreateOrUpdateSettings
): Promise<AccSettings> => {
  logger.info("entering::upsertSettingsInDb::repository");

  const store = requestStorage.getStore();
  const omitted = customOmit<CreateOrUpdateSettings, "id" | "existing">(data, [
    "id",
    "existing",
  ]);

  if (data.existing) {
    return db.accSettings.update({
      where: { id: data.existing.id },
      data: {
        ...omitted.rest,
        updatedBy: store?.user?.id,
      },
    });
  } else {
    return db.accSettings.create({
      data: {
        ...omitted.rest,
        createdBy: store?.user?.id,
      },
    });
  }
};

export const getSettingsByIdFromDb = async (
  id: number
): Promise<AccSettings | null> => {
  logger.info("entering::getSettingsByIdFromDb::repository");
  return db.accSettings.findFirst({
    where: { id, isActive: true },
  });
};

export const getSettingFromDb = async (): Promise<AccSettings | null> => {
  logger.info("entering::getSettingsByIdFromDb::repository");
  return db.accSettings.findFirst({
    where: { isActive: true },
  });
};

export const getAllSettingsFromDb = async (): Promise<AccSettings[]> => {
  logger.info("entering::getSettingsFromDb::repository");
  return db.accSettings.findMany({
    where: { isActive: true },
  });
};

export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  logger.info("entering::getCompanySettings::repository");
  return db.companySettings.findFirst({
    where: {},
  });
};
