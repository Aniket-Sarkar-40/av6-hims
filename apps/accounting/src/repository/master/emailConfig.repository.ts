import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { db } from "@repo/db";
import {
  AccEmailConfig,
  EmailConfigType,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const getEmailConfigByTypeFromDb = async (
  configType: EmailConfigType,
) => {
  logger.info("entering::getEmailConfigByTypeFromDb::repository");
  return db.accEmailConfig.findFirst({
    where: { isActive: true, configType },
  });
};

export const upsertEmailConfigByTypeInDb = async (
  data: CreateOrUpdateEmailConfig,
): Promise<AccEmailConfig> => {
  logger.info("entering::upsertEmailConfigByTypeInDb::repository");

  const omitted = customOmit<CreateOrUpdateEmailConfig, "existing">(data, [
    "existing",
  ]);

  if (data.existing?.id) {
    return db.accEmailConfig.update({
      where: { id: data.existing.id },
      data: { ...omitted.rest },
    });
  }

  return db.accEmailConfig.create({
    data: { ...omitted.rest },
  });
};
