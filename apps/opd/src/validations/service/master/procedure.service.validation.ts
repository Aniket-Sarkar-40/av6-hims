import {
  getProcedureByIdFromDb,
  getProcedureByNameFromDb,
} from "@/repository/master/procedure.repository.js";
import {
  CreateProcedureMasterInput,
  FetchProcedureInput,
  UpdateProcedureMasterInput,
} from "@/types/master/procedure.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCollectionCenter } from "./collectionCenter.service.validation.js";
import { validateIdInsurance } from "../insurance/insurance.service.validation.js";
import { validateIdCorporateClient } from "../corporate/corporate.service.validation.js";

export const validateIdProcedure = async (id: number) => {
  logger.info("entering::validateIdProcedure::service::validation");
  validIdCheck(id);
  const response = await getProcedureByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Procedure"));
  }
  logger.info("exiting::validateIdProcedure::service::validation");
  return response;
};

export const createProcedureServiceValidation = async (
  input: CreateProcedureMasterInput,
) => {
  logger.info("entering::createProcedure::service::validation");

  await validateIdCollectionCenter(input.ccId);
  const existing = await getProcedureByNameFromDb(input.procedureName);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Procedure"),
    );
  }

  logger.info("exiting::createProcedure::service::validation");
};
export const updateProcedureServiceValidation = async (
  input: UpdateProcedureMasterInput,
) => {
  logger.info("entering::updateProcedure::service::validation");

  await validateIdProcedure(input.id);
  await validateIdCollectionCenter(input.ccId);
  const existing = await getProcedureByNameFromDb(input.procedureName);
  if (existing && existing.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Procedure"),
    );
  }

  logger.info("exiting::updateProcedure::service::validation");
};

export const fetchProcedureServiceValidation = async (
  input: FetchProcedureInput,
) => {
  logger.info("entering::fetchProcedure::service::validation");
  const { procedureId, type, typeId } = input;
  await validateIdProcedure(procedureId);
  const typeValidators: Record<string, (id: number) => Promise<unknown>> = {
    INSURANCE: validateIdInsurance,
    CORPORATE: validateIdCorporateClient,
  };

  if (type && typeId && typeValidators[type]) {
    await typeValidators[type](typeId);
  }

  logger.info("exiting::fetchProcedure::service::validation");
};
