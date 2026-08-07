import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { logger } from "@repo/platform/logging/logger.js";
import { BloodBankSetting } from "@repo/db/generated/prisma/client";

export const createSettingsInDb = async (
  data: CreateOrUpdateSettings,
): Promise<BloodBankSetting> => {
  logger.info("entering::createSettingsInDb::repository");
  return db.$transaction(
    async (tx) => {
      const prevSettings = await tx.bloodBankSetting.findFirst({
        where: {
          isActive: true,
        },
      });
      if (!prevSettings) {
        return tx.bloodBankSetting.create({
          data,
        });
      } else {
        return tx.bloodBankSetting.update({
          where: {
            id: prevSettings.id,
          },
          data,
        });
      }
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getSettingsFromDb = async (): Promise<BloodBankSetting | null> => {
  logger.info("entering::getSettingsFromDb::repository");
  return db.bloodBankSetting.findFirst({
    where: {
      isActive: true,
    },
  });
};
