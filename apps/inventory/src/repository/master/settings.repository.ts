import { db } from "@repo/db/client";
import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { logger } from "@repo/platform/logging/logger.js";
import { InvSettings } from "@repo/db/generated/prisma/client";

export const createSettingsInDb = async (
  data: CreateOrUpdateSettings,
): Promise<InvSettings> => {
  logger.info("entering::createSettings::repository");
  return db.$transaction(async (tx) => {
    const prevSettings = await tx.invSettings.findFirst({
      where: {
        isActive: true,
      },
    });
    if (!prevSettings) {
      return tx.invSettings.create({
        data,
      });
    } else {
      return tx.invSettings.update({
        where: {
          id: prevSettings.id,
        },
        data,
      });
    }
  });
};

export const getSettingsInDb = async (): Promise<InvSettings | null> => {
  logger.info("entering::getSettingsInDb::repository");
  return db.invSettings.findFirst({
    where: {
      isActive: true,
    },
  });
};
