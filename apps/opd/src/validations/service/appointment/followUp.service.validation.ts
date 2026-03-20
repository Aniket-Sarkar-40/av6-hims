import {
  getFollowUpByAppointmentIdFromDb,
  getFollowUpByIdFromDb,
} from "@/repository/appointment/followUp.repository.js";
import { CreateFollowUpInput } from "@/types/appointment/followUp.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateIdFollowUp = async (id: number) => {
  logger.info("entering::validateIdFollowUp::service::validation");
  validIdCheck(id);
  const followUp = await getFollowUpByIdFromDb(id);
  if (!followUp) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Follow Up"),
    );
  }
  logger.info("exiting::validateIdFollowUp::service::validation");
  return followUp;
};
export const createFollowUpServiceValidation = async (
  input: CreateFollowUpInput,
) => {
  logger.info("entering::createFollowUp::service::validation");
  const appointment = await validateIdAppointment(input.appointmentId);
  input.patientId = appointment.patientId;
  input.doctorId = appointment.doctorId;

  const existing = await getFollowUpByAppointmentIdFromDb(input.appointmentId);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Patient Follow Up"),
    );
  }
  logger.info("exiting::createFollowUp::service::validation");
};
