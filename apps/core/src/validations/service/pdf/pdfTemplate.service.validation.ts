import {
  getPdfTemplateByIdFromDb,
  getPdfTemplateByNameFromDb,
} from "@/repository/pdf/pdfTemplate.repository.js";
import {
  CreatePdfTemplateInput,
  MakeDefaultPdfTemplateInput,
  UpdatePdfTemplateInput,
} from "@/types/pdf/pdfTemplate.js";
import { PdfTemplate } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validIdPdfTemplate = async (id: number): Promise<PdfTemplate> => {
  logger.info("entering::validIdPdfTemplate::service::validation");
  validIdCheck(id);
  const response = await getPdfTemplateByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Pdf Template"),
    );
  }
  logger.info("exiting::validIdPdfTemplate::service::validation");
  return response;
};

export const createPdfTemplateServiceValidation = async (
  input: CreatePdfTemplateInput,
) => {
  logger.info("entering::createPdfTemplate::service::validation");
  const existing = await getPdfTemplateByNameFromDb(input.templateName);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Pdf Template with template name ${input.templateName}`,
      ),
    );
  }
  logger.info("exiting::createPdfTemplate::service::validation");
};

export const updatePdfTemplateServiceValidation = async (
  input: UpdatePdfTemplateInput,
) => {
  logger.info("entering::updatePdfTemplate::service::validation");

  const valid = await validIdPdfTemplate(input.id);
  const existing = await getPdfTemplateByNameFromDb(input.templateName);
  if (existing && existing.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Pdf Template with template name ${input.templateName}`,
      ),
    );
  }
  // if (valid.sampleImageUrl) deleteFileByEnv(process.cwd() + valid.sampleImageUrl);
  logger.info("exiting::updatePdfTemplate::service::validation");
};
export const makeDefaultPdfTemplateServiceValidation = async (
  input: MakeDefaultPdfTemplateInput,
) => {
  logger.info("entering::makeDefaultPdfTemplate::service::validation");

  const valid = await validIdPdfTemplate(input.id);
  if (valid.isDefault) {
    throw new ErrorHandler(400, "Pdf Template is already set as default");
  }
  input.module = valid.module;
  input.templateType = valid.templateType;
  logger.info("exiting::makeDefaultPdfTemplate::service::validation");
};
