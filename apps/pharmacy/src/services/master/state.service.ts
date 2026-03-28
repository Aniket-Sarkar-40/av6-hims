import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

import { State } from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import {
  CreateStateInput,
  StateDTO,
  StateDTOForState,
  UpdateStateInput,
} from "@/types/master/state.js";
import {
  deleteStateServiceValidation,
  nameStateServiceValidation,
  updateIdStateServiceValidation,
} from "@/validations/service/master/state.service.validation.js";
import {
  createStateInDb,
  deleteStateInDb,
  getAllstateFromDb,
  getStateByIdFromDb,
  updateStateInDb,
} from "@/repository/master/state.repository.js";
import {
  toStateDTO,
  toStateDTOForState,
} from "@/mapper/master/state.mapper.js";
import { checkIsCacheable, getMasterRedisKey } from "@/config/cache.config.js";

const cacheKey = getMasterRedisKey("STATE", "all");

export const stateService = {
  async createState(input: CreateStateInput): Promise<StateDTOForState> {
    logger.info("entering::createState::service");
    await nameStateServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STATE);
    logger.info(`Cacheable for STATE: ${isCacheable}`);
    const state = await createStateInDb(input);

    if (isCacheable && state) {
      await addToCache(cacheKey, state.id, state);
    }
    const stateDto = await toStateDTOForState(state);
    logger.info("exiting::createState::service");
    return stateDto;
  },

  async getAllStates(): Promise<StateDTOForState[]> {
    logger.info("entering::getAllStates::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STATE);
    if (isCacheable) {
      const cachedStates = (await getAllCache(cacheKey)) as State[] | null;
      if (cachedStates && cachedStates.length > 0) {
        const stateDTOS = await Promise.all(
          cachedStates.map((state) => toStateDTOForState(state)),
        );

        return stateDTOS;
      }

      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "States"));
    } else {
      const states = await getAllstateFromDb();
      if (states.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "States"),
        );
      }

      const stateDTOS = await Promise.all(
        states.map((state) => toStateDTOForState(state)),
      );
      logger.info("exiting::getAllStates::service");
      return stateDTOS;
    }
  },

  async getStateById(
    stateId: number,
    canNullReturnable: boolean = false,
  ): Promise<StateDTO | null> {
    logger.info("entering::getStateById::service");
    validIdCheck(stateId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STATE);
    let state: State | null;
    if (isCacheable) {
      state = (await getCacheById(cacheKey, stateId)) as State | null;
    } else {
      state = await getStateByIdFromDb(stateId);
    }
    if (!state) {
      if (!canNullReturnable)
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "State"));
      else return null;
    }
    const stateDTO = await toStateDTO(state);
    logger.info("exiting::getStateById::service");
    return stateDTO;
  },

  // Service method to update a state
  async updateState(input: UpdateStateInput): Promise<StateDTOForState> {
    logger.info("entering::updateState::service");

    // Validate the request body and stateId
    await updateIdStateServiceValidation(input);

    // Update the state in the database
    const isCacheable = await checkIsCacheable(SHORT_CODE.STATE);
    const updatedState = await updateStateInDb(input);

    // If cacheable, update the cache with the new state data
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedState);
    }

    // Convert the updated state to a DTO for response
    const stateDto = await toStateDTOForState(updatedState);

    logger.info("exiting::updateState::service");
    return stateDto;
  },

  async deleteState(stateId: number): Promise<{ message: string }> {
    logger.info("entering::deleteState::service");
    await deleteStateServiceValidation(stateId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STATE);
    await deleteStateInDb(stateId);
    if (isCacheable) {
      await deleteCache(cacheKey, stateId);
    }
    logger.info("exiting::deleteState::service");
    return { message: "state deleted successfully" };
  },
};
