import { getConsultationByIdFromDb } from "@/repository/appointment/consultation.repository.js";
import { CreateConsultationInput } from "@/types/appointment/consultation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdAppointment } from "./appointment.service.validation.js";
import { validIdConsultationNotesMappingByDoctorId } from "../master/consultationNotesMappings.service.validation.js";

export const validateIdConsultation = async (id: number) => {
  logger.info("entering::validateIdConsultation::service::validation");
  validIdCheck(id);
  const consultation = await getConsultationByIdFromDb(id);
  if (!consultation) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patient Consultation Notes"),
    );
  }
  logger.info("exiting::validateIdConsultation::service::validation");
  return consultation;
};
export const createConsultationServiceValidation = async (
  input: CreateConsultationInput,
) => {
  logger.info("entering::createConsultation::service::validation");

  const appointment = await validateIdAppointment(input.appointmentId);
  input.patientId = appointment.patientId;

  // Get all notes mapping by doctor id
  const mapping = await validIdConsultationNotesMappingByDoctorId(
    appointment.doctorId,
  );
  const mappingNotesIds = mapping.map((mapping) => mapping.consultationNotesId);

  // Traverse consultationNotes and validate each key
  const notes = input.consultationNotes as Record<string, string>;

  for (const [key] of Object.entries(notes)) {
    if (!mappingNotesIds.includes(Number(key))) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ID", "Consultation Notes Mapping "),
      );
    }
  }

  logger.info("exiting::createConsultation::service::validation");
};
