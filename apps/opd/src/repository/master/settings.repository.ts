import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { logger } from "@repo/platform/logging/logger.js";
import { OpdSettings } from "@repo/db/generated/prisma/client";

export const createSettingsInDb = async (
  data: CreateOrUpdateSettings,
): Promise<OpdSettings> => {
  logger.info("entering::createSettingsInDb::repository");
  return db.$transaction(
    async (tx) => {
      const prevSettings = await tx.opdSettings.findFirst({
        where: {
          isActive: true,
        },
      });
      if (!prevSettings) {
        return tx.opdSettings.create({
          data,
        });
      } else {
        return tx.opdSettings.update({
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

export const getSettingsFromDb = async (): Promise<OpdSettings | null> => {
  logger.info("entering::getSettingsFromDb::repository");
  return db.opdSettings.findFirst({
    where: {
      isActive: true,
    },
  });
};
