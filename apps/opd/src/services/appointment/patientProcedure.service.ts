import {
  createPatientProcedureInDb,
  returnPatientProcedureInDb,
  updatePatientProcedureInDb,
} from "@/repository/appointment/patientProcedure.repository.js";
import {
  PatientProcedureCreateInput,
  PatientProcedureReturnInput,
  PatientProcedureUpdateInput,
} from "@/types/appointment/patientProcedure.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createPatientProcedureServiceValidation,
  returnPatientProcedureServiceValidation,
  updatePatientProcedureServiceValidation,
} from "@/validations/service/appointment/patientProcedure.service.validation.js";

export const patientProcedureService = {
  async createPatientProcedure(input: PatientProcedureCreateInput) {
    logger.info("entering::createPatientProcedure::service");
    await createPatientProcedureServiceValidation(input);
    const response = await createPatientProcedureInDb(input);
    logger.info("exiting::createPatientProcedure::service");
    return response;
  },
  async updatePatientProcedure(input: PatientProcedureUpdateInput) {
    logger.info("entering::updatePatientProcedure::service");
    await updatePatientProcedureServiceValidation(input);
    const response = await updatePatientProcedureInDb(input);
    logger.info("exiting::updatePatientProcedure::service");
    return response;
  },
  async returnPatientProcedure(input: PatientProcedureReturnInput) {
    logger.info("entering::returnPatientProcedure::service");
    await returnPatientProcedureServiceValidation(input);
    const response = await returnPatientProcedureInDb(input);
    logger.info("exiting::returnPatientProcedure::service");
    return response;
  },
};
