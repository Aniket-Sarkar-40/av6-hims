import {
  getTemplateByIdFromDb,
  getTemplateByTemplateCodeFromDb,
  getTemplateByTemplateNameAndTypeFromDb,
} from "@/repository/master/template.repository.js";
import { CreateOrUpdateTemplate } from "@/types/master/template.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

import { Template } from "@repo/db/generated/prisma/client";

export const validIdTemplate = async (id: number): Promise<Template> => {
  logger.info("entering::validIdTemplate::service::validation");

  validIdCheck(id);

  const row = await getTemplateByIdFromDb(id);
  if (!row) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Template"));
  }
  logger.info("exiting::validIdTemplate::service::validation");

  return row;
};

export const updateTemplateServiceValidation = async (
  body: CreateOrUpdateTemplate
) => {
  logger.info("entering::updateTemplateServiceValidation::service::validation");

  if (body.id) validIdCheck(body.id);

  if (body.id) {
    await validIdTemplate(body.id);
  }
  const byNameAndType = await getTemplateByTemplateNameAndTypeFromDb(
    body.templateName,
    body.templateType
  );

  if (byNameAndType && byNameAndType.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Duplicate Template with name "${body.templateName}" and type "${body.templateType}"`
      )
    );
  }
  if (body.templateCode) {
    const byCode = await getTemplateByTemplateCodeFromDb(body.templateCode);

    if (byCode && byCode.id !== body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          ` Template  code "${body.templateCode}"`
        )
      );
    }
  }
  logger.info("exiting::updateTemplateServiceValidation::service::validation");
};

export const createTemplateServiceValidation = async (
  body: CreateOrUpdateTemplate
): Promise<Template | null> => {
  logger.info("entering::createTemplateServiceValidation::service::validation");

  const byNameAndType = await getTemplateByTemplateNameAndTypeFromDb(
    body.templateName,
    body.templateType
  );

  if (byNameAndType) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Template with name "${body.templateName}" and type "${body.templateType}" already exists`
      )
    );
  }

  if (body.templateCode) {
    const byCode = await getTemplateByTemplateCodeFromDb(body.templateCode);
    if (byCode) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `Template code "${body.templateCode}"`
        )
      );
    }
  }

  logger.info("exiting::createTemplateServiceValidation::service::validation");
  return null;
};
