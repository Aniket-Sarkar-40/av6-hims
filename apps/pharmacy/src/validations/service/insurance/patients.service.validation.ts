import {
  getPatientsByIdFromDb,
  getPatientsByUniqueIdFromDb,
  getPatientsEmailByMobileNoFromDb,
  getPatientsMobileNoByMobileNoFromDb,
} from "@/repository/insurance/patients.repository.js";
import { getCorporateClientById } from "@/repository/opd/corporate.repository.js";
import { PatientReq } from "@/types/insurance/patients.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { ClientMaster } from "@repo/db/generated/prisma/client";

export const validateIdPatients = async (id: number) => {
  logger.info("entering::validateIdPatients service::validation");
  validIdCheck(id);
  const patient = await getPatientsByIdFromDb(id);
  if (!patient) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Patients"));
  }
  logger.info("exiting::validateIdPatients::service::validation");

  return patient;
};

export const validateIdPatientsByUniqueId = async (id: number) => {
  logger.info("entering::validateIdPatients service::validation");
  validIdCheck(id);
  const patient = await getPatientsByUniqueIdFromDb(id);
  if (!patient) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Patients"));
  }
  logger.info("exiting::validateIdPatients::service::validation");

  return patient;
};

export const createPatientsServiceValidation = async (body: PatientReq) => {
  logger.info("entering::createPatientsServiceValidation::service::validation");

  const mobileNo = await getPatientsMobileNoByMobileNoFromDb(body.mobileNo);
  const email = await getPatientsEmailByMobileNoFromDb(body.email);
  let client: ClientMaster | null = null;

  if (mobileNo) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Mobile Number"),
    );
  }
  if (email) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Email"),
    );
  }
  if (body.clientId) {
    client = await getCorporateClientById(Number(body.clientId));
    if (!client) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Client"));
    }
  }

  logger.info("exiting::createPatientsServiceValidation::service::validation");
};

export const updatePatientsServiceValidation = async (body: PatientReq) => {
  logger.info("entering::updatePatientsServiceValidation::service::validation");

  if (body.id == null) {
    logger.error("missing patients id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Patients id"),
    );
  }
  logger.info(`validating existence of patients id=${body.id}`);
  await validateIdPatients(body.id);
  let client: ClientMaster | null = null;
  if (body.clientId) {
    client = await getCorporateClientById(Number(body.clientId));
    if (!client) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Client"));
    }
  }
  logger.info("exiting::updatePatientsServiceValidation::service::validation");
};

export const formatAmount = (amount: number) => {
  const formattedAmount = amount.toFixed(2);
  return parseFloat(formattedAmount);
};

export const deletePatientsServiceValidation = async (id: number) => {
  logger.info("entering::deletePatientsServiceValidation::service::validation");

  await validateIdPatients(id);

  logger.info("exiting::deletePatientsServiceValidation::service::validation");
};
