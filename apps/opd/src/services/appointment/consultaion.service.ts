import { createConsultationInDb } from "@/repository/appointment/consultation.repository.js";
import { CreateConsultationInput } from "@/types/appointment/consultation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { createConsultationServiceValidation } from "@/validations/service/appointment/consultation.service.validation.js";

export const consultationService = {
  async createConsultation(input: CreateConsultationInput) {
    logger.info("entering::createConsultation::service");
    await createConsultationServiceValidation(input);
    const createdResponse = await createConsultationInDb(input);
    logger.info("exiting::createConsultation::service");
    return createdResponse;
  },
};
