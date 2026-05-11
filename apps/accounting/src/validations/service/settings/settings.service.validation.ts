import { settingsService } from "@/services/settings/settings.service.js";
import { CreateOrUpdateSettings } from "@/types/settings/settings.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { AccSettings } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdSettings = async (id: number): Promise<AccSettings> => {
  logger.info("entering::validateIdSettings::service::validation");

  validIdCheck(id);

  const row = await settingsService.getSettingsById(id, true);
  if (!row) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Settings"));
  }
  logger.info("exiting::validateIdSettings::service::validation");

  return row;
};

export const validateUpsertSettingsServiceValidation = async (
  input: CreateOrUpdateSettings
) => {
  logger.info("entering::validateUpsertSettings::service::validation");

  if (input.id) {
    const existing = await validateIdSettings(input.id);
    input.existing = existing;
  }

  logger.info("exiting::validateUpsertSettings::service::validation");
};
