import {
  getPatientConsultationByAppointmentIdFromDb,
  getPatientConsultationByIdFromDb,
} from "@/repository/appointment/patientConsultation.repository.js";
import {
  CreatePatientConsultationInput,
  UpdatePatientConsultationInput,
} from "@/types/appointment/patientConsultation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const validateIdPatientConsultation = async (id: number) => {
  logger.info("entering::validateIdPatientConsultation::service::validation");
  validIdCheck(id);
  const patientConsultation = await getPatientConsultationByIdFromDb(id);
  if (!patientConsultation) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Consultation"),
    );
  }
  logger.info("exiting::validateIdPatientConsultation::service::validation");
  return patientConsultation;
};

export const createPatientConsultationServiceValidation = async (
  body: CreatePatientConsultationInput,
): Promise<void> => {
  logger.info(
    "entering::createPatientConsultationServiceValidation::service::validation",
  );

  // await validateIdPatients(body.patientId);
  //validate appointment Id here

  const appointment = await validateIdAppointment(body.appointmentId);
  body.patientId = appointment.patientId;

  const patientConsultationAppointment =
    await getPatientConsultationByAppointmentIdFromDb(body.appointmentId);

  if (patientConsultationAppointment) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("DUPLICATE_ITEM", "Patient Consultation"),
    );
  }

  logger.info(
    "exiting::createPatientConsultationServiceValidation::service::validation",
  );
};

export const updatePatientConsultationServiceValidation = async (
  body: UpdatePatientConsultationInput,
): Promise<void> => {
  logger.info(
    "entering::updatePatientConsultationServiceValidation::service::validation",
  );

  const existing = validateIdPatientConsultation(body.id);
  if (!existing) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Consultation ID"),
    );
  }

  logger.info(
    "exiting::updatePatientConsultationServiceValidation::service::validation",
  );
};

export const getPatientConsultationByAppointmentIdServiceValidation = async (
  appointmentId: number,
): Promise<void> => {
  logger.info(
    "entering::createPatientConsultationServiceValidation::service::validation",
  );

  // Validate appointment Id here
  await validateIdAppointment(appointmentId);
  logger.info(
    "exiting::createPatientConsultationServiceValidation::service::validation",
  );
};
