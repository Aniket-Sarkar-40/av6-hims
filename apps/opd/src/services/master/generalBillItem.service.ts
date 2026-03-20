import { toGeneralBillItemMasterDTO } from "@/mapper/master/generalBillItem.mapper.js";
import {
  createGeneralBillItemInDb,
  getAllGeneralBillItemFromDb,
  getGeneralBillItemByIdFromDb,
  getGeneralBillItemFromDb,
  updateGeneralBillItemInDb,
} from "@/repository/master/generalBillItem.repository.js";
import {
  CreateGeneralBillItemMasterInput,
  GeneralBillItemMasterDTO,
  UpdateGeneralBillItemMasterInput,
} from "@/types/master/generalBillItem.js";
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
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createGeneralBillItemServiceValidation,
  updateGeneralBillItemServiceValidation,
} from "@/validations/service/master/generalBillItem.service.validation.js";
import { GeneralBillItem } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("GENERAL_BILL_ITEM", "all");

export const generalBillItemService = {
  async createGeneralBillItem(
    input: CreateGeneralBillItemMasterInput,
  ): Promise<GeneralBillItemMasterDTO> {
    logger.info("entering::createGeneralBillItem::service");

    await createGeneralBillItemServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.GENERAL_BILL_ITEM);
    const created = await createGeneralBillItemInDb(input);
    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createGeneralBillItem::service");
    return toGeneralBillItemMasterDTO(created);
  },

  async updateGeneralBillItem(
    input: UpdateGeneralBillItemMasterInput,
  ): Promise<GeneralBillItemMasterDTO> {
    logger.info("entering::updateGeneralBillItem::service");

    await updateGeneralBillItemServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.GENERAL_BILL_ITEM);
    const updated = await updateGeneralBillItemInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateGeneralBillItem::service");
    return toGeneralBillItemMasterDTO(updated);
  },

  async getGeneralBillItemById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<GeneralBillItemMasterDTO | null> {
    logger.info("entering::getGeneralBillItemById::service");

    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.GENERAL_BILL_ITEM);
    let generalBillItem: GeneralBillItem | null;

    if (isCacheable) {
      generalBillItem = (await getCacheById(
        cacheKey,
        id,
      )) as GeneralBillItem | null;
    } else {
      generalBillItem = await getGeneralBillItemByIdFromDb(id);
    }

    if (!generalBillItem) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "General Bill Item"),
        );
      else return null;
    }

    logger.info("exiting::getGeneralBillItemById::service");
    return toGeneralBillItemMasterDTO(generalBillItem);
  },

  async getAllGeneralBillItem(): Promise<GeneralBillItemMasterDTO[]> {
    logger.info("entering::getAllGeneralBillItem::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.GENERAL_BILL_ITEM);
    let generalBillItems: GeneralBillItem[] = [];

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as GeneralBillItem[];
      if (cached && cached.length > 0) {
        generalBillItems = cached;
      } else {
        generalBillItems = await getAllGeneralBillItemFromDb();
      }
    } else {
      generalBillItems = await getAllGeneralBillItemFromDb();
    }

    logger.info("exiting::getAllGeneralBillItem::service");
    return await Promise.all(
      generalBillItems.map((item) => toGeneralBillItemMasterDTO(item)),
    );
  },

  async getGeneralBillItemByIdWoDto(
    id: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getGeneralBillItemByIdWoDto::service");

    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.GENERAL_BILL_ITEM);
    let generalBillItem: GeneralBillItem | null;

    if (isCacheable) {
      generalBillItem = (await getCacheById(
        cacheKey,
        id,
      )) as GeneralBillItem | null;
    } else {
      generalBillItem = await getGeneralBillItemByIdFromDb(id);
    }

    if (!generalBillItem) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "General Bill Item"),
        );
      else return null;
    }

    logger.info("exiting::getGeneralBillItemByIdWoDto::service");
    return generalBillItem;
  },

  async getAllGeneralBillItemWoDto(): Promise<GeneralBillItem[]> {
    logger.info("entering::getAllGeneralBillItemWoDto::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.GENERAL_BILL_ITEM);
    let generalBillItems: GeneralBillItem[] = [];

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as GeneralBillItem[];
      if (cached && cached.length > 0) {
        generalBillItems = cached;
      } else {
        generalBillItems = await getGeneralBillItemFromDb();
      }
    } else {
      generalBillItems = await getGeneralBillItemFromDb();
    }

    logger.info("exiting::getAllGeneralBillItemWoDto::service");
    return generalBillItems;
  },
};
