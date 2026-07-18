import {
  toStateDTOForState,
  toStateDTO,
} from "@/mapper/master/state.mapper.js";
import {
  createStateInDb,
  getAllstateFromDb,
  getStateByIdFromDb,
  updateStateInDb,
  deleteStateInDb,
} from "@/repository/master/state.repository.js";
import {
  CreateStateInput,
  StateDTOForState,
  StateDTO,
  UpdateStateInput,
} from "@/types/master/state.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
  deleteCache,
} from "@repo/platform/cache/redis.utils.js";
import { getMasterRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  nameStateServiceValidation,
  updateIdStateServiceValidation,
  deleteStateServiceValidation,
} from "@/validations/service/master/state.service.validation.js";
import { State } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { auditProxy } from "@/config/audit.config.js";

const cacheKey = getMasterRedisKey("STATE", "all");

const stateServiceRaw = {
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

export const stateService = auditProxy.createAuditedService(
  "state",
  stateServiceRaw,
);
