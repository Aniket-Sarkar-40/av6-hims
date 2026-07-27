import { commonFetch } from "@/repository/common.repository.js";
import { shortCodeService } from "@/services/shortCode.service.js";
import { CommonFieldScalarValue } from "@/types/common.js";
import { validateModelFieldUpdate } from "@/utils/prismaModelField.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { UpdateConfigByCodeInput } from "av6-core-v2";

export const commonShortCodeServiceValidation = async (
  shortCode: string,
  id: number,
) => {
  logger.info(
    "entering::commonShortCodeServiceValidation::service::validation",
  );

  validIdCheck(id);

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Short Code"),
    );
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};
export const commonShortCodeCreateServiceValidation = async (
  shortCode: string,
) => {
  logger.info(
    "entering::commonShortCodeServiceValidation::service::validation",
  );

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Short Code"),
    );
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};

export const commonLockUnlockValidation = async (
  shortCode: string,
  id: number,
) => {
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

export const validateUpdateDynamicShortCodeConfig = async (
  input: UpdateConfigByCodeInput,
) => {
  logger.info(
    "entering::validateUpdateDynamicShortCodeConfig::service::validation",
  );

  const existing = await commonShortCodeCreateServiceValidation(
    input.shortCode,
  );

  input.existing = existing;
  logger.info(
    "exiting::validateUpdateDynamicShortCodeConfig::service::validation",
  );
};

export const commonActiveInactiveValidation = async (
  shortCode: string,
  id: number,
  field: string,
  value: unknown,
) => {
  logger.info("entering::commonActiveInactiveValidation::service::validation");

  validIdCheck(id);

  const shortCodeData = await commonShortCodeServiceValidation(shortCode, id);

  const tableName = shortCodeData.tableName;

  const { normalizedValue } = validateModelFieldUpdate(tableName, field, value);

  // @ts-expect-error dynamic model
  const model = db[tableName];

  if (!model) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_TABLE"));
  }

  const existingRecord = await model.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingRecord) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Id"));
  }

  logger.info("exiting::commonActiveInactiveValidation::service::validation");

  return {
    shortCodeData,
    normalizedValue: normalizedValue as CommonFieldScalarValue | Date,
  };
};
