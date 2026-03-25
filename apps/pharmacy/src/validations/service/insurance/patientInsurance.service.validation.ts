import { getPatientsInsuranceByIdFromDb } from "@/repository/insurance/patientInsurance.repository.js";
import { PatientInsuranceReq } from "@/types/insurance/patientsInsurance.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdInsurance } from "./insurance.service.validation.js";
import { validateIdPatientsByUniqueId } from "./patients.service.validation.js";

export const validateIdPatientsInsurance = async (id: number) => {
  logger.info("entering::validateIdPatientsInsurance service::validation");
  validIdCheck(id);
  const patientsInsurance = await getPatientsInsuranceByIdFromDb(id);
  if (!patientsInsurance) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "patientsInsurance"),
    );
  }
  logger.info("exiting::validateIdPatientsInsurance::service::validation");

  return patientsInsurance;
};

export const createPatientsInsuranceServiceValidation = async (
  body: PatientInsuranceReq,
) => {
  logger.info(
    "entering::createPatientsInsuranceServiceValidation::service::validation",
  );

  await validateIdPatientsByUniqueId(body.patientId);
  await validateIdInsurance(body.insurerId);

  logger.info(
    "exiting::createPatientsInsuranceServiceValidation::service::validation",
  );
};

export const updatePatientsInsuranceServiceValidation = async (
  body: PatientInsuranceReq,
) => {
  logger.info(
    "entering::updatePatientsInsuranceServiceValidation::service::validation",
  );

  if (body.id == null) {
    logger.error("missing patientsInsurance id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "patientsInsurance id"),
    );
  }
  logger.info(`validating existence of patientsInsurance id=${body.id}`);
  await validateIdPatientsInsurance(body.id);

  await validateIdPatientsByUniqueId(body.patientId);
  await validateIdInsurance(body.insurerId);

  logger.info(
    "exiting::updatePatientsInsuranceServiceValidation::service::validation",
  );
};

export const deletePatientsInsuranceServiceValidation = async (id: number) => {
  logger.info(
    "entering::deletePatientsInsuranceServiceValidation::service::validation",
  );

  await validateIdPatientsInsurance(id);

  logger.info(
    "exiting::deletePatientsInsuranceServiceValidation::service::validation",
  );
};
