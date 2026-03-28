import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { db } from "@repo/db";
import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { PmsSettings } from "@repo/db/generated/prisma/client";

export const createSettingsInDb = async (
  data: CreateOrUpdateSettings,
): Promise<PmsSettings> => {
  logger.info("entering::createSettings::repository");
  const omittedData = customOmit<CreateOrUpdateSettings, "id">(data, ["id"]);
  return db.$transaction(
    async (tx) => {
      const prevSettings = await tx.pmsSettings.findFirst({
        where: {
          isActive: true,
        },
      });
      if (!prevSettings) {
        return tx.pmsSettings.create({
          data: omittedData.rest,
        });
      } else {
        return tx.pmsSettings.update({
          where: {
            id: prevSettings.id,
          },
          data: omittedData.rest,
        });
      }
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getSettingsInDb = async (): Promise<PmsSettings | null> => {
  logger.info("entering::getSettingsInDb::repository");
  return db.pmsSettings.findFirst({
    where: {
      isActive: true,
    },
  });
};
