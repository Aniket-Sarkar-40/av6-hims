import {
  createClinicalHistoryInDb,
  updateClinicalHistoryInDb,
} from "@/repository/appointment/clinicalHistory.repository.js";
import {
  CreateClinicalHistoryInput,
  UpdateClinicalHistoryInput,
} from "@/types/appointment/clinicalHistory.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createClinicalHistoryServiceValidation,
  updateClinicalHistoryServiceValidation,
  validateIdClinicalHistory,
} from "@/validations/service/appointment/clinicalHistory.service.validation.js";

export const clinicalHistoryService = {
  async createClinicalHistory(input: CreateClinicalHistoryInput) {
    logger.info("entering::createClinicalHistory::service");
    await createClinicalHistoryServiceValidation(input);
    const createdResponse = await createClinicalHistoryInDb(input);
    logger.info("exiting::createClinicalHistory::service");
    return createdResponse;
  },
  async updateClinicalHistory(input: UpdateClinicalHistoryInput) {
    logger.info("entering::updateClinicalHistory::service");
    await updateClinicalHistoryServiceValidation(input);
    const updatedResponse = await updateClinicalHistoryInDb(input);
    logger.info("exiting::updateClinicalHistory::service");
    return updatedResponse;
  },
  async getClinicalHistoryById(id: number) {
    logger.info("entering::getClinicalHistoryById::service");
    const fetchedResponse = await validateIdClinicalHistory(id);
    logger.info("exiting::getClinicalHistoryById::service");
    return fetchedResponse;
  },
};
