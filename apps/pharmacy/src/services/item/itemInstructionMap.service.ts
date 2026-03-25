import {
  createItemInstructionMapInDb,
  deleteItemInstructionMapInDB,
  updateItemInstructionMapInDb,
} from "@/repository/item/itemInstructionMap.repository.js";
import { CreateItemInstructionMap } from "@/types/item/itemDosageMap.js";
import {
  createItemInstructionMapServiceValidation,
  updateItemInstructionMapServiceValidation,
  validateIdItemInstructionMap,
} from "@/validations/service/item/itemInstruction.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

export const itemInstructionService = {
  async createItemInstructionMap(input: CreateItemInstructionMap) {
    logger.info("entering::createItemInstructionMap::service");
    await createItemInstructionMapServiceValidation(input);
    await createItemInstructionMapInDb(input);
    logger.info("exiting::createItemInstructionMap::service");
  },

  async updateItemInstructionMap(input: CreateItemInstructionMap) {
    logger.info("entering::updateItemInstructionMap::service");
    await updateItemInstructionMapServiceValidation(input);
    await updateItemInstructionMapInDb(input);
    logger.info("exiting::updateItemInstructionMap::service");
  },

  async deleteItemInstructionMap(id: number) {
    logger.info("entering::deleteItemInstructionMap::service");
    await validateIdItemInstructionMap(id);
    await deleteItemInstructionMapInDB(id);
    logger.info("exiting::deleteItemInstructionMap::service");
  },
};
