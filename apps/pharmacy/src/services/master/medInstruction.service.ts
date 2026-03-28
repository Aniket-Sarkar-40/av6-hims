import {
  createMedInstructionInDb,
  getAllMedInstructionFromDb,
  getMedInstructionByIdFromDb,
  updateMedInstructionInDb,
} from "@/repository/master/medInstruction.repository.js";
import { InstructionName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createMedInstructionServiceValidation,
  updateIdMedInstructionServiceValidation,
} from "@/validations/service/master/medInstruction.service.validation.js";
import { MedicineInstruction } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("MED_INST", "all");

export const medInstructionService = {
  async createMedInstruction(input: InstructionName) {
    logger.info("entering::medInstructionService::service");
    await createMedInstructionServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.INST);
    const medInstruction = await createMedInstructionInDb(input);
    if (isCacheable && medInstruction) {
      await addToCache(cacheKey, medInstruction.id, medInstruction);
    }
    logger.info("exiting::medInstructionService::service");
    return medInstruction;
  },

  async getAllMedInstruction() {
    logger.info("entering::getAllMedInstruction::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.INST);
    if (isCacheable) {
      const cachedMedInstruction = (await getAllCache(cacheKey)) as
        | MedicineInstruction[]
        | null;
      if (cachedMedInstruction && cachedMedInstruction.length > 0) {
        return cachedMedInstruction;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Instruction"),
        );
      }
    } else {
      const medInstruction = await getAllMedInstructionFromDb();
      if (medInstruction.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      }
      logger.info("exiting::getAllMedCompo::service");
      return medInstruction;
    }
  },

  async getMedInstructionById(
    medInstructionId: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getCMedInstructionById::service");
    validIdCheck(medInstructionId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.INST);
    let medInstruction: MedicineInstruction | null;
    if (isCacheable) {
      medInstruction = (await getCacheById(
        cacheKey,
        medInstructionId,
      )) as MedicineInstruction | null;
    } else {
      medInstruction = await getMedInstructionByIdFromDb(medInstructionId);
    }
    if (!medInstruction) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      else return null;
    }
    logger.info("exiting::getCMedInstructionById::service");
    return medInstruction;
  },

  async updateMedInstruction(
    input: InstructionName,
  ): Promise<MedicineInstruction> {
    logger.info("entering::updateMedInstruction::service");
    await updateIdMedInstructionServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.INST);
    const updatedMedInstruction = await updateMedInstructionInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id!, updatedMedInstruction);
    }
    logger.info("exiting::updateMedInstruction::service");
    return updatedMedInstruction;
  },
};
