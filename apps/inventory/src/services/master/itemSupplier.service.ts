import { toItemSupplierDTO } from "@/mapper/master/itemSupplier.mapper.js";
import {
  createItemSupplierInDb,
  deleteItemSupplierByIdFromDb,
  getAllItemSupplierFromDb,
  getItemSupplierByIdFromDb,
  updateItemSupplierInDb,
} from "@/repository/master/itemSupplier.repository.js";
import {
  ItemSupplierCreateInput,
  ItemSupplierDTO,
  ItemSupplierResponse,
  ItemSupplierUpdateInput,
} from "@/types/master/itemSupplier.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import {
  createItemSupplierServiceValidation,
  deleteItemSupplierServiceValidation,
  updateItemSupplierServiceValidation,
} from "@/validations/service/master/itemSupplier.service.validation.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { InvItemSupplier } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("ITEM_SUPPLIER", "all");

export const itemSupplierService = {
  async createItemSupplier(
    input: ItemSupplierCreateInput
  ): Promise<ItemSupplierDTO> {
    logger.info("entering::createItemSupplier::service");
    await createItemSupplierServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    const itemSupplier = await createItemSupplierInDb(input);

    if (isCacheable && itemSupplier) {
      await addToCache(cacheKey, itemSupplier.id, itemSupplier);
    }
    logger.info("exiting::createItemSupplier::service");
    const itemSupplierDTO = await toItemSupplierDTO([itemSupplier]);
    return itemSupplierDTO[0];
  },

  async updateItemSupplier(
    input: ItemSupplierUpdateInput
  ): Promise<ItemSupplierDTO> {
    logger.info("entering::updateItemSupplier::service");
    await updateItemSupplierServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    const updatedItemSupplier = await updateItemSupplierInDb(input);
    if (isCacheable && updatedItemSupplier) {
      await updateCache(cacheKey, input.id, updatedItemSupplier);
    }
    logger.info("exiting::updateItemSupplier::service");
    const itemSupplierDTO = await toItemSupplierDTO([updatedItemSupplier]);
    return itemSupplierDTO[0];
  },
  async getAllItemSupplier(
    canNullReturnable: boolean = false
  ): Promise<ItemSupplierDTO[]> {
    logger.info("entering::getAllItemSupplier::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse[];
    if (isCacheable) {
      itemSupplier = (await getAllCache(cacheKey)) as ItemSupplierResponse[];
    } else {
      itemSupplier = await getAllItemSupplierFromDb();
    }
    logger.info("exiting::getAllItemSupplier::service");
    if (itemSupplier.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Supplier")
        );
      else return [];
    }
    return toItemSupplierDTO(itemSupplier);
  },
  async getItemSupplierById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<ItemSupplierDTO | null> {
    logger.info("entering::getItemSupplierById::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse | null;
    if (isCacheable) {
      itemSupplier = (await getCacheById(
        cacheKey,
        id
      )) as ItemSupplierResponse | null;
    } else {
      itemSupplier = await getItemSupplierByIdFromDb(id);
    }

    if (!itemSupplier) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Supplier")
        );
      } else return null;
    }

    logger.info("exiting::getItemSupplierById::service");
    const itemSupplierDTO = await toItemSupplierDTO([itemSupplier]);
    return itemSupplierDTO[0];
  },
  async deleteItemSupplierById(id: number): Promise<void> {
    logger.info("entering::deleteItemSupplierById::service");
    await deleteItemSupplierServiceValidation(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    await deleteItemSupplierByIdFromDb(id);
    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    logger.info("exiting::deleteItemSupplierById::service");
  },
  async getAllItemSupplierWoDto(
    canNullReturnable: boolean = false
  ): Promise<InvItemSupplier[]> {
    logger.info("entering::getAllItemSupplierWoDto::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse[];
    if (isCacheable) {
      itemSupplier = (await getAllCache(cacheKey)) as ItemSupplierResponse[];
    } else {
      itemSupplier = await getAllItemSupplierFromDb();
    }
    logger.info("exiting::getAllItemSupplierWoDto::service");
    if (itemSupplier.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Supplier")
        );
      else return [];
    }
    return itemSupplier;
  },
};
