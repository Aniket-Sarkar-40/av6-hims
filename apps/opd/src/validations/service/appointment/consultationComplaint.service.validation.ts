import { CreateConsultationComplaintsInput } from "@/types/appointment/consultationComplaint.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const createConsultationComplaintServiceValidation = async (
  body: CreateConsultationComplaintsInput,
): Promise<void> => {
  logger.info(
    "entering::createPatientConsultationServiceValidation::service::validation",
  );

  const appointment = await validateIdAppointment(body.appointmentId);
  body.patientId = appointment.patientId;

  // Validate appointment Id here

  logger.info(
    "exiting::createPatientConsultationServiceValidation::service::validation",
  );
};

export const getAppointmentIdConsultationServiceValidation = async (
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
