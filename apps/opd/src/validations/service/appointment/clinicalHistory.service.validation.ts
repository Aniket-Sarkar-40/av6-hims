import { getClinicalHistoryByIdFromDb } from "@/repository/appointment/clinicalHistory.repository.js";
import { patientsService } from "@/services/patient/patient.service.js";
import {
  CreateClinicalHistoryInput,
  UpdateClinicalHistoryInput,
} from "@/types/appointment/clinicalHistory.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateIdClinicalHistory = async (id: number) => {
  logger.info("entering::validateIdClinicalHistory::service::validation");
  validIdCheck(id);
  const clinicalHistory = await getClinicalHistoryByIdFromDb(id);
  if (!clinicalHistory) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Clinaical History"),
    );
  }
  logger.info("exiting::validateIdClinicalHistory::service::validation");
  return clinicalHistory;
};
export const createClinicalHistoryServiceValidation = async (
  input: CreateClinicalHistoryInput,
) => {
  logger.info("entering::createClinicalHistory::service::validation");

  const appointment = await validateIdAppointment(input.appointmentId);
  input.patientId = appointment.patientId;
  const patient = await patientsService.getPatientsById(appointment.patientId);
  if (patient && patient.gender === "Male") {
    if (input.isPregnant) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Pregnant"),
      );
    }
    if (input.isBreastFeeding) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Pregnant"),
      );
    }
  }
  logger.info("exiting::createClinicalHistory::service::validation");
};
export const updateClinicalHistoryServiceValidation = async (
  input: UpdateClinicalHistoryInput,
) => {
  logger.info("entering::updateClinicalHistory::service::validation");
  const { id, ...rest } = input;

  await validateIdClinicalHistory(id);

  await createClinicalHistoryServiceValidation(rest);
  logger.info("exiting::updateClinicalHistory::service::validation");
};
export const fetchClinicalHistoryServiceValidation = async (
  appointmentId: number,
) => {
  logger.info("entering::fetchClinicalHistory::service::validation");

  await validateIdAppointment(appointmentId);

  logger.info("exiting::fetchClinicalHistory::service::validation");
};
