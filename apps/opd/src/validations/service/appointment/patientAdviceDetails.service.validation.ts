import { CreatePatientAdviceDetailsInput } from "@/types/appointment/patientAdviceDetails.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validateIdAppointment } from "./appointment.service.validation.js";

export const createPatientAdviceDetailsServiceValidation = async (
  body: CreatePatientAdviceDetailsInput,
): Promise<void> => {
  logger.info(
    "entering::createPatientAdviceDetailsServiceValidation::service::validation",
  );

  // await validateIdPatients(body.patientId);
  //validate appointment Id here
  const appointment = await validateIdAppointment(body.appointmentId);
  body.patientId = appointment.patientId;

  logger.info(
    "exiting::createPatientAdviceDetailsServiceValidation::service::validation",
  );
};

export const getPatientAdviceDetailsByAppointmentIdServiceValidation = async (
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
