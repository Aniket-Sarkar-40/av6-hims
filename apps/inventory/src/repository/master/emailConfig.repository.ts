import { EventEmail } from "@repo/db/generated/prisma/client";

import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import { EmailConfig } from "@repo/db/generated/prisma/client";

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
