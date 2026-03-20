import {
  createPatientAdviceDetailsInDb,
  getPatientAdviceDetailsByAppointmentIdFromDb,
} from "@/repository/appointment/PatientAdviceDetails.repository.js";
import { CreatePatientAdviceDetailsInput } from "@/types/appointment/patientAdviceDetails.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createPatientAdviceDetailsServiceValidation,
  getPatientAdviceDetailsByAppointmentIdServiceValidation,
} from "@/validations/service/appointment/patientAdviceDetails.service.validation.js";

export const patientAdviceDetailsService = {
  async createPatientAdviceDetails(input: CreatePatientAdviceDetailsInput) {
    logger.info("entering::createPatientAdviceDetails::service");
    await createPatientAdviceDetailsServiceValidation(input);
    const createPatientAdviceDetails =
      await createPatientAdviceDetailsInDb(input);
    logger.info("exiting::createPatientAdviceDetails::service");
    return createPatientAdviceDetails;
  },

  async getPatientAdviceDetailsByAppointmentId(
    appointmentId: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getPatientAdviceDetailsByAppointmentId::service");
    //appointmentId Validation check req
    await getPatientAdviceDetailsByAppointmentIdServiceValidation(
      appointmentId,
    );

    const row =
      await getPatientAdviceDetailsByAppointmentIdFromDb(appointmentId);

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Patient Advice Details"),
        );
      else return null;
    }

    logger.info("exiting::getPatientAdviceDetailsByAppointmentId::service");
    return row;
  },
};
