import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { logger } from "@repo/platform/logging/logger.js";
import { BloodBankSettings } from "@repo/db/generated/prisma/client";

export const createSettingsInDb = async (
  data: CreateOrUpdateSettings
): Promise<BloodBankSettings> => {
  logger.info("entering::createSettingsInDb::repository");
  return db.$transaction(
    async (tx) => {
      const prevSettings = await tx.bloodBankSettings.findFirst({
        where: {
          isActive: true,
        },
      });
      if (!prevSettings) {
        return tx.bloodBankSettings.create({
          data,
        });
      } else {
        return tx.bloodBankSettings.update({
          where: {
            id: prevSettings.id,
          },
          data,
        });
      }
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export const getSettingsFromDb =
  async (): Promise<BloodBankSettings | null> => {
    logger.info("entering::getSettingsFromDb::repository");
    return db.bloodBankSettings.findFirst({
      where: {
        isActive: true,
      },
    });
  };
