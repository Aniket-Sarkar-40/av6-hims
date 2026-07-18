import { settingsService } from "@/services/settings/settings.service.js";
import {
  CreateOrUpdateSettings,
  SettingsDTO,
} from "@/types/settings/settings.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdSettings = async (id: number): Promise<SettingsDTO> => {
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
  if (input.mainBranchId) {
    await validateIdCollectionCenter(input.mainBranchId);
  }

  logger.info("exiting::validateUpsertSettings::service::validation");
};
