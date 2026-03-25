import { logger } from "@/utils/logger.utils";
import { validIdCheck } from "../global.validation";
import { shortCodeService } from "@/services/shortCode.service";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import ErrorHandler from "@/utils/errorHandler.utils";
import { commonFetch, commonFetchCreate } from "@/repository/common.repository";
import { UpdateConfigByCodeInput } from "av6-core";

export const commonShortCodeServiceValidation = async (shortCode: string, id: number) => {
  logger.info("entering::commonShortCodeServiceValidation::service::validation");

  validIdCheck(id);

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Short Code"));
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};
export const commonShortCodeCreateServiceValidation = async (shortCode: string) => {
  logger.info("entering::commonShortCodeServiceValidation::service::validation");

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Short Code"));
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};

export const commonLockUnlockValidation = async (shortCode: string, id: number) => {
  logger.info("entering::commonLockValidation::service::validation");

  validIdCheck(id);

  const shortCodeData = await commonShortCodeServiceValidation(shortCode, id);

  const existingRecord = await commonFetch({
    shortCode,
    id,
    shortCodeData,
  });

  if (!existingRecord) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Id"));
  }

  logger.info("exiting::commonLockValidation::service::validation");

  return shortCodeData;
};

export const commonCreateValidation = async (shortCode: string, name: string) => {
  logger.info("entering::commonCreateValidation::service::validation");

  const shortCodeData = await commonShortCodeCreateServiceValidation(shortCode);

  const existingRecord = await commonFetchCreate({
    name,
    shortCode,
    shortCodeData,
  });

  if (existingRecord) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Name"));
  }

  logger.info("exiting::commonCreateValidation::service::validation");

  return shortCodeData;
};

export const commonUpdateValidation = async (shortCode: string, id: number, name: string) => {
  logger.info("entering::commonUpdateValidation::service::validation");

  const shortCodeData = await commonShortCodeServiceValidation(shortCode, id);

  const existingRecord = await commonFetchCreate({
    name,
    shortCode,
    shortCodeData,
  });

  if (existingRecord && existingRecord.id !== id) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Name"));
  }

  logger.info("exiting::commonUpdateValidation::service::validation");
  return shortCodeData;
};

export const validateUpdateDynamicShortCodeConfig = async (input: UpdateConfigByCodeInput) => {
  logger.info("entering::validateUpdateDynamicShortCodeConfig::service::validation");

  const existing = await commonShortCodeCreateServiceValidation(input.shortCode);

  input.existing = existing;
  logger.info("exiting::validateUpdateDynamicShortCodeConfig::service::validation");
};
