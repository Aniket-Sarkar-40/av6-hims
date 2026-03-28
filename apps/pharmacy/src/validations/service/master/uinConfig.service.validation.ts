import {
  getUINConfigByIdFromDb,
  getUINConfigByShortCodeFromDb,
} from "@/repository/master/uinConfig.repository.js";
import {
  CreateUINConfigRequest,
  UpdateUINConfigRequest,
} from "@/types/master/uinConfig.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { PmsUINConfig } from "@repo/db/generated/prisma/client";

export const validateIdUinConfig = async (uinConfigId: number) => {
  logger.info("entering::validateIdUinConfig::service::validation");

  validIdCheck(uinConfigId);

  const uinConfig = await getUINConfigByIdFromDb(uinConfigId);
  if (!uinConfig || uinConfig.isActive === false) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Uin Config"),
    );
  }
  logger.info("exiting::validateIdUinConfig::service::validation");

  return uinConfig;
};

export const updateIdUinConfigServiceValidation = async (
  body: UpdateUINConfigRequest,
): Promise<PmsUINConfig> => {
  logger.info(
    "entering::updateIdUinConfigServiceValidation::service::validation",
  );

  const uin = await validateIdUinConfig(body.id);

  const uinConfig = await getUINConfigByShortCodeFromDb(body.shortCode);

  if (uinConfig && uinConfig.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "UinConfig"),
    );
  }
  logger.info(
    "exiting::updateIdUinConfigServiceValidation::service::validation",
  );
  return uin;
};

export const createUinConfigServiceValidation = async (
  body: CreateUINConfigRequest,
): Promise<void> => {
  logger.info(
    "entering::createUinConfigServiceValidation::service::validation",
  );

  const uinConfig = await getUINConfigByShortCodeFromDb(body.shortCode);
  if (uinConfig) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "UinConfig Short Code"),
    );
  }
  logger.info("exiting::createUinConfigServiceValidation::service::validation");

  return;
};
