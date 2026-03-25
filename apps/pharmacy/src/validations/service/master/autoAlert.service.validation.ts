import {
  getAutoAlertAuditByIdFromDb,
  getAutoAlertEmailByIdFromDb,
  getAutoAlertEmailByShortCodeFromDb,
} from "@/repository/master/autoAlert.repository.js";
import {
  CreateAutoAlertEmailInput,
  UpdateAutoAlertEmailInput,
} from "@/types/master/autoAlert.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdAutoAlertEmail = async (id: number) => {
  logger.info("entering::validateIdAutoAlertEmail::service::validation");
  validIdCheck(id);
  const record = await getAutoAlertEmailByIdFromDb(id);
  if (!record) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Auto alert email"),
    );
  }
  logger.info("exiting::validateIdAutoAlertEmail::service::validation");
  return record;
};

export const validateIdAutoAlertAudit = async (id: number) => {
  logger.info("entering::validateIdAutoAlertAudit::service::validation");
  validIdCheck(id);
  const record = await getAutoAlertAuditByIdFromDb(id);
  if (!record) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Auto alert audit"),
    );
  }
  logger.info("exiting::validateIdAutoAlertAudit::service::validation");
  return record;
};

export const createAutoAlertEmailServiceValidation = async (
  input: CreateAutoAlertEmailInput,
) => {
  logger.info("entering::createAutoAlertEmail::service::validation");
  const existing = await getAutoAlertEmailByShortCodeFromDb(input.shortCode);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Auto alert email"),
    );
  }
  logger.info("exiting::createAutoAlertEmail::service::validation");
};

export const updateAutoAlertEmailServiceValidation = async (
  input: UpdateAutoAlertEmailInput,
) => {
  logger.info("entering::updateAutoAlertEmail::service::validation");
  await validateIdAutoAlertEmail(input.id);
  const existing = await getAutoAlertEmailByShortCodeFromDb(input.shortCode);
  if (existing && existing.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Auto alert email"),
    );
  }
  logger.info("exiting::updateAutoAlertEmail::service::validation");
};

export const resendAutoAlertEmailServiceValidation = async (
  auditId: number,
) => {
  logger.info("entering::resendAutoAlertEmail::service::validation");
  const audit = await validateIdAutoAlertAudit(auditId);
  if (audit.status === "SENT") {
    throw new ErrorHandler(400, "Email already sent");
  }
  logger.info("exiting::resendAutoAlertEmail::service::validation");

  return audit;
};
