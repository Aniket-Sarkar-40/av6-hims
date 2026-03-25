import {
  EMAIL_TYPE,
  EventEmail,
  Prisma,
} from "@repo/db/generated/prisma/client";

import { EmailConfig } from "@repo/db/generated/prisma/client";
import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";

export const getEmailConfigFromDb = async (): Promise<EmailConfig | null> => {
  logger.info("entering::getEmailConfig::repository");
  return db.emailConfig.findFirst({
    where: { isActive: "yes" },
  });
};

export const getEventEmailFromDb = async (): Promise<EventEmail | null> => {
  logger.info("entering::getEventEmailFromDb::repository");
  return db.eventEmail.findFirst({
    where: { isActive: true },
  });
};

export const createEmailConfigInDb = async (
  data: CreateOrUpdateEmailConfig,
): Promise<EmailConfig> => {
  logger.info("entering::createEmailConfig::repository");
  return db.emailConfig.create({
    data,
  });
};

export const deleteEmailConfigInDb = async (
  id: number,
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

export const getEventEmailByEmailType = async (
  input: EMAIL_TYPE,
): Promise<EventEmail | null> => {
  logger.info("entering::getEventEmailByEmailType::repository");
  return db.eventEmail.findFirst({
    where: { emailType: input, isActive: true },
  });
};
