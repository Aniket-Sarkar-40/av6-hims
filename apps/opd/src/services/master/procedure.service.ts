import {
  toFetchProcedureResponse,
  toProcedureMasterDTO,
} from "@/mapper/master/procedure.mapper.js";
import {
  createProcedureInDb,
  getProcedureByIdFromDb,
  updateProcedureInDb,
} from "@/repository/master/procedure.repository.js";
import {
  CreateProcedureMasterInput,
  FetchProcedureInput,
  FetchProcedureResponse,
  ProcedureMasterDTO,
  UpdateProcedureMasterInput,
} from "@/types/master/procedure.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createProcedureServiceValidation,
  fetchProcedureServiceValidation,
  updateProcedureServiceValidation,
} from "@/validations/service/master/procedure.service.validation.js";
import { ProcedureMaster } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("PROCEDURE", "all");

export const procedureService = {
  async createProcedure(
    input: CreateProcedureMasterInput,
  ): Promise<ProcedureMasterDTO> {
    logger.info("entering::createProcedure::service");

    await createProcedureServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.PROCEDURE);
    const created = await createProcedureInDb(input);
    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createProcedure::service");
    return toProcedureMasterDTO(created);
  },
  async updateProcedure(
    input: UpdateProcedureMasterInput,
  ): Promise<ProcedureMasterDTO> {
    logger.info("entering::updateProcedure::service");

    await updateProcedureServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.PROCEDURE);
    const updated = await updateProcedureInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateProcedure::service");
    return toProcedureMasterDTO(updated);
  },
  async getProcedureById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<ProcedureMasterDTO | null> {
    logger.info("entering::updateProcedure::service");

    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.PROCEDURE);
    let procedure: ProcedureMaster | null;

    if (isCacheable) {
      procedure = (await getCacheById(cacheKey, id)) as ProcedureMaster | null;
    } else {
      procedure = await getProcedureByIdFromDb(id);
    }

    if (!procedure) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Procedure"),
        );
      else return null;
    }

    logger.info("exiting::updateProcedure::service");
    return toProcedureMasterDTO(procedure);
  },
  async fetchProcedure(
    input: FetchProcedureInput,
  ): Promise<FetchProcedureResponse> {
    logger.info("entering::fetchProcedure::service");
    await fetchProcedureServiceValidation(input);
    const response = await toFetchProcedureResponse(input);
    logger.info("exiting::fetchProcedure::service");
    return response;
  },
};
