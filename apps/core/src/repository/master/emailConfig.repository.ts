import { db } from "@repo/db/client";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { logger } from "@repo/platform/logging/logger.js";
import { EmailConfig, Prisma } from "@repo/db/generated/prisma/client";

export const getEmailConfigFromDb = async (): Promise<EmailConfig | null> => {
  logger.info("entering::getEmailConfig::repository");
  return db.emailConfig.findFirst({
    where: { isActive: "yes" },
  });
};

export const createEmailConfigInDb = async (
  data: CreateOrUpdateEmailConfig
): Promise<EmailConfig> => {
  logger.info("entering::createEmailConfig::repository");
  return db.emailConfig.create({
    data,
  });
};

export const deleteEmailConfigInDb = async (
  id: number
): Promise<EmailConfig> => {
  logger.info("entering::deleteEmailConfig::repository");
  return db.emailConfig.update({
    where: { id },
    data: { isActive: "no" },
  });
};

export const deleteAllEmailConfigsInDb =
  async (): Promise<Prisma.BatchPayload> => {
    logger.info("entering::deleteAllEmailConfigs::repository");
    return db.emailConfig.deleteMany({});
  };
