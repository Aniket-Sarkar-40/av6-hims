import { getCountryByIdFromDb } from "@/repository/master/country.repository.js";
import {
  getStateByIdFromDb,
  getStateByNameFromDb,
} from "@/repository/master/state.repository.js";
import { CreateStateInput, UpdateStateInput } from "@/types/master/state.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validIdState = async (stateId: number) => {
  logger.info("entering::validIdState::service::validation");

  validIdCheck(stateId);

  const state = await getStateByIdFromDb(stateId);
  if (!state || state.isActive === false) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "State"));
  }
  logger.info("exiting::validIdState::service::validation");

  return state;
};

export const deleteStateServiceValidation = async (
  stateId: number
): Promise<void> => {
  logger.info("entering::deleteStateServiceValidation::service::validation");

  await validIdState(stateId);

  logger.info("exiting::deleteStateServiceValidation::service::validation");
  return;
};

export const getIdStateServiceValidation = async (
  stateId: number
): Promise<void> => {
  logger.info("entering::getIdStateServiceValidation::service::validation");
  await validIdState(stateId);
  logger.info("exiting::getIdStateServiceValidation::service::validation");
  return;
};

export const updateIdStateServiceValidation = async (
  body: UpdateStateInput
): Promise<void> => {
  logger.info("entering::updateIdStateServiceValidation::service::validation");

  await validIdState(body.id);
  const state = await getStateByIdFromDb(body.id);
  if (!state || state.isActive === false) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "State"));
  }

  if (body.name !== state.name) {
    const stateByName = await getStateByNameFromDb(body.name, body.countryId);

    if (stateByName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "State Name")
      );
    }
  }

  logger.info("exiting::updateIdStateServiceValidation::service::validation");
  return;
};

export const nameStateServiceValidation = async (
  input: CreateStateInput
): Promise<void> => {
  logger.info("entering::nameStateServiceValidation::service::validation");
  await validateStateForeignKeys(input);
  const state = await getStateByNameFromDb(input.name, input.countryId);
  if (state && state.isActive) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "State")
    );
  }
  logger.info("exiting::nameStateServiceValidation::service::validation");
  return;
};

export const validateStateForeignKeys = async (
  input: CreateStateInput
): Promise<void> => {
  logger.info("entering::validateStateForeignKeys::service::validation");
  const country = await getCountryByIdFromDb(input.countryId);
  if (!country) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FOREIGN_KEY", "state")
    );
  }
  logger.info("exiting::validateStateForeignKeys::service::validation");
};
