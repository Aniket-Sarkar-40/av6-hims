import {
  createPatientConsultationInDb,
  updatePatientConsultationInDb,
} from "@/repository/appointment/patientConsultation.repository.js";
import {
  CreatePatientConsultationInput,
  UpdatePatientConsultationInput,
} from "@/types/appointment/patientConsultation.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createPatientConsultationServiceValidation,
  updatePatientConsultationServiceValidation,
} from "@/validations/service/appointment/patientConsultation.service.validation.js";

export const patientConsultationService = {
  async createPatientConsultation(input: CreatePatientConsultationInput) {
    logger.info("entering::createPatientConsultation::service");
    await createPatientConsultationServiceValidation(input);
    const createPatientConsultation =
      await createPatientConsultationInDb(input);
    logger.info("exiting::createPatientConsultation::service");
    return createPatientConsultation;
  },

  async updatePatientConsultation(input: UpdatePatientConsultationInput) {
    logger.info("entering::updatePatientConsultation::service");
    await updatePatientConsultationServiceValidation(input);
    const updatedPatientConsultation =
      await updatePatientConsultationInDb(input);
    logger.info("exiting::updatePatientConsultation::service");
    return updatedPatientConsultation;
  },
};
