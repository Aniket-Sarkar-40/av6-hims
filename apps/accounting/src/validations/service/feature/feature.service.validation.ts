import {
  getFeatureFlagByIdFromDb,
  getFeatureFlagByShortCodeFromDb,
} from "@/repository/feature/feature.repository.js";
import {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@/types/feature/feature.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdFeatureFlag = async (id: number) => {
  logger.info("entering::validateIdFeatureFlag::service::validation");
  validIdCheck(id);
  const record = await getFeatureFlagByIdFromDb(id);
  if (!record) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Feature Flag"),
    );
  }
  logger.info("exiting::validateIdFeatureFlag::service::validation");
  return record;
};

export const validateCreateFeatureFlag = async (
  input: CreateFeatureFlagInput,
) => {
  logger.info("entering::validateCreateFeatureFlag::service::validation");
  const existing = await getFeatureFlagByShortCodeFromDb(input.shortCode);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Feature Flag"),
    );
  }
  logger.info("exiting::validateCreateFeatureFlag::service::validation");
  return;
};

export const validateUpdateFeatureFlag = async (
  input: UpdateFeatureFlagInput,
) => {
  logger.info("entering::validateUpdateFeatureFlag::service::validation");
  const { id, shortCode } = input;
  await validateIdFeatureFlag(id);
  const existing = await getFeatureFlagByShortCodeFromDb(shortCode);
  if (existing && existing.id !== id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Feature Flag"),
    );
  }
  logger.info("exiting::validateUpdateFeatureFlag::service::validation");
  return;
};
