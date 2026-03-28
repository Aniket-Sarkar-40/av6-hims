import {
  createItemDosageMapInDb,
  deleteItemDosageMapInDB,
  updateItemDosageMapInDb,
} from "@/repository/item/itemDosageMap.repository.js";
import { CreateItemDosageMap } from "@/types/item/itemDosageMap.js";
import {
  createItemDosageMapServiceValidation,
  updateItemDosageMapServiceValidation,
  validateIdItemDosageMap,
} from "@/validations/service/item/item.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

export const itemDosageService = {
  async createItemDosageMap(input: CreateItemDosageMap) {
    logger.info("entering::createItemDosageMap::service");
    await createItemDosageMapServiceValidation(input);
    await createItemDosageMapInDb(input);
    logger.info("exiting::createItemDosageMap::service");
  },

  async updateItemDosageMap(input: CreateItemDosageMap) {
    logger.info("entering::updateItemDosageMap::service");
    await updateItemDosageMapServiceValidation(input);
    await updateItemDosageMapInDb(input);
    logger.info("exiting::updateItemDosageMap::service");
  },

  async deleteItemDosageMap(id: number) {
    logger.info("entering::deleteItemDosageMap::service");
    await validateIdItemDosageMap(id);
    await deleteItemDosageMapInDB(id);
    logger.info("exiting::deleteItemDosageMap::service");
  },
};
