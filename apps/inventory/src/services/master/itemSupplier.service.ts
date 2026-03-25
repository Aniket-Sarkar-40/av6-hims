import { toAllItemSupplierDTO, toItemSupplierDTO } from "@/mapper/master/itemSupplier.mapper";
import {
  createItemSupplierInDb,
  deleteItemSupplierByIdFromDb,
  getAllItemSupplierFromDb,
  getItemSupplierByIdFromDb,
  updateItemSupplierInDb,
} from "@/repository/master/itemSupplier.repository";
import {
  ItemSupplierCreateInput,
  ItemSupplierDTO,
  ItemSupplierResponse,
  ItemSupplierUpdateInput,
} from "@/types/master/itemSupplier";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import {
  addToCache,
  checkIsCacheable,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import {
  createItemSupplierServiceValidation,
  deleteItemSupplierServiceValidation,
  updateItemSupplierServiceValidation,
} from "@/validations/service/master/itemSupplier.service.validation";

const cacheKey = getRedisKey("ITEM_SUPPLIER", "all");

export const itemSupplierService = {
  async createItemSupplier(input: ItemSupplierCreateInput): Promise<ItemSupplierDTO> {
    logger.info("entering::createItemSupplier::service");
    await createItemSupplierServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    const itemSupplier = await createItemSupplierInDb(input);

    if (isCacheable && itemSupplier) {
      await addToCache(cacheKey, itemSupplier.id, itemSupplier);
    }
    logger.info("exiting::createItemSupplier::service");

    return await toItemSupplierDTO(itemSupplier);
  },
  async updateItemSupplier(input: ItemSupplierUpdateInput): Promise<ItemSupplierDTO> {
    logger.info("entering::updateItemSupplier::service");
    await updateItemSupplierServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    const updatedItemSupplier = await updateItemSupplierInDb(input);
    if (isCacheable && updatedItemSupplier) {
      await updateCache(cacheKey, input.id, updatedItemSupplier);
    }
    logger.info("exiting::updateItemSupplier::service");
    return await toItemSupplierDTO(updatedItemSupplier);
  },
  async getAllItemSupplier(canNullReturnable: boolean = false): Promise<ItemSupplierDTO[]> {
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
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier"));
      else return [];
    }
    return toAllItemSupplierDTO(itemSupplier);
  },
  async getItemSupplierById(id: number, canNullReturnable: boolean = false): Promise<ItemSupplierDTO | null> {
    logger.info("entering::getItemSupplierById::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse | null;
    if (isCacheable) {
      itemSupplier = (await getCacheById(cacheKey, id)) as ItemSupplierResponse | null;
    } else {
      itemSupplier = await getItemSupplierByIdFromDb(id);
    }

    if (!itemSupplier) {
      if (!canNullReturnable) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier"));
      } else return null;
    }

    logger.info("exiting::getItemSupplierById::service");
    return await toItemSupplierDTO(itemSupplier);
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
};
