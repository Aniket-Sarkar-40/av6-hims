import { getDocumentByIdFromDb } from "@/repository/appointment/doucment.repository.js";
import { DocumentMasterReq } from "@/types/appointment/document.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateIdDocument = async (id: number) => {
  logger.info("entering::validateIdDocument::service::validation");
  validIdCheck(id);
  const document = await getDocumentByIdFromDb(id);
  if (!document) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Document"));
  }
  logger.info("exiting::validateIdDocument::service::validation");
  return document;
};

export const createDocumentServiceValidation = async (
  input: DocumentMasterReq,
) => {
  logger.info("entering::createDocumentServiceValidation::service::validation");
  const appointment = await validateIdAppointment(input.appointmentId);
  input.patientId = appointment.patientId;

  logger.info("exiting::createDocumentServiceValidation::service::validation");
};
