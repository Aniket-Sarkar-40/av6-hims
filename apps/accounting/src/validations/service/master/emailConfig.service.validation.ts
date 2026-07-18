import { getEmailConfigByTypeFromDb } from "@/repository/master/emailConfig.repository.js";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { EmailConfigType } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createOrUpdateEmailConfigServiceValidation = async (
  body: CreateOrUpdateEmailConfig,
) => {
  logger.info(
    "entering::createOrUpdateEmailConfigServiceValidation::service::validation",
  );

  const type: EmailConfigType = body.configType ?? "ADMIN";

  const existing = await getEmailConfigByTypeFromDb(type);

  body.configType = type;
  body.existing = existing;

  logger.info(
    "exiting::createOrUpdateEmailConfigServiceValidation::service::validation",
  );
};
