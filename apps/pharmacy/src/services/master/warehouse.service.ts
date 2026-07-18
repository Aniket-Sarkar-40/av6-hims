import { toWarehouseDTO } from "@/mapper/master/warehouse.mapper.js";
import {
  createWarehouseInDb,
  getAllWarehouseFromDb,
  getWarehouseByIdFromDb,
  toggleActiveWarehouse,
  updateWarehouseInDb,
} from "@/repository/master/warehouse.repository.js";
import { WarehouseDTO, WarehouseReq } from "@/types/master/warehouse.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createWarehouseServiceValidation,
  updateIdWarehouseServiceValidation,
  validateWarehouseId,
} from "@/validations/service/master/warehouse.service.validation.js";
import { PmsWarehouse } from "@repo/db/generated/prisma/client";
import { ToggleActive } from "av6-core-v2";

const cacheKey = getRedisKey("WAREHOUSE", "all");

export const warehouseService = {
  async createWarehouse(input: WarehouseReq): Promise<WarehouseDTO> {
    logger.info("entering::createWarehouse::service");
    await createWarehouseServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    const warehouse = await createWarehouseInDb(input);
    if (isCacheable && warehouse) {
      await addToCache(cacheKey, warehouse.id, warehouse);
    }
    const warehouseDTO = await toWarehouseDTO(warehouse);
    logger.info("exiting::createWarehouse::service");
    return warehouseDTO;
  },

  async updateWarehouse(input: WarehouseReq): Promise<WarehouseDTO> {
    logger.info("entering::updateWarehouse::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating Warehouse");
    }
    await updateIdWarehouseServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    const updatedWarehouse = await updateWarehouseInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedWarehouse);
    }

    logger.info("exiting::updateWarehouse::service");
    const updatedWarehouseDTO = await toWarehouseDTO(updatedWarehouse);
    return updatedWarehouseDTO;
  },

  async getAllWarehouse(
    canNullReturnable: boolean = false,
  ): Promise<WarehouseDTO[]> {
    logger.info("entering::getAllWarehouse::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    if (isCacheable) {
      const cachedWarehouse = (await getAllCache(cacheKey)) as
        | PmsWarehouse[]
        | null;
      if (cachedWarehouse && cachedWarehouse.length > 0) {
        return await Promise.all(
          cachedWarehouse.map((warehouse) => toWarehouseDTO(warehouse)),
        );
      } else {
        if (!canNullReturnable)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Warehouse"),
          );
        else return [];
      }
    } else {
      const warehouse = await getAllWarehouseFromDb();

      const warehouseDTO = await Promise.all(
        warehouse.map((warehouse) => toWarehouseDTO(warehouse)),
      );
      if (warehouseDTO.length === 0 && !canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Warehouse"),
        );
      }
      logger.info("exiting::getAllWarehouse::service");
      return warehouseDTO;
    }
  },

  async getAllWarehouseWoDTO(): Promise<PmsWarehouse[]> {
    logger.info("entering::getAllWarehouse::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    if (isCacheable) {
      const cachedWarehouse = (await getAllCache(cacheKey)) as PmsWarehouse[];
      return cachedWarehouse ?? [];
    } else {
      const warehouse = await getAllWarehouseFromDb();
      return warehouse;
    }
  },

  async getWarehouseById(
    warehouseId: number,
    canNullReturnable: boolean = false,
  ): Promise<WarehouseDTO | null> {
    logger.info("entering::getWarehouseById::service");
    validIdCheck(warehouseId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    let warehouse: PmsWarehouse | null;
    let warehouseDTO = null;

    if (isCacheable) {
      warehouse = (await getCacheById(
        cacheKey,
        warehouseId,
      )) as PmsWarehouse | null;

      if (warehouse !== null) {
        warehouseDTO = await toWarehouseDTO(warehouse);
      }
    } else {
      warehouse = await getWarehouseByIdFromDb(warehouseId);

      if (warehouse !== null) {
        warehouseDTO = await toWarehouseDTO(warehouse);
      }
    }

    if (!warehouseDTO) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Warehouse"),
        );
      else return null;
    }

    logger.info("exiting::getWarehouseById::service");
    return warehouseDTO;
  },

  async getWarehouseByIdWoDTO(
    warehouseId: number,
    canNullReturnable: boolean = false,
  ): Promise<PmsWarehouse | null> {
    logger.info("entering::getWarehouseByIdWoDTO::service");
    validIdCheck(warehouseId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    let warehouse: PmsWarehouse | null;

    if (isCacheable) {
      warehouse = (await getCacheById(
        cacheKey,
        warehouseId,
      )) as PmsWarehouse | null;
    } else {
      warehouse = await getWarehouseByIdFromDb(warehouseId);
    }

    if (!warehouse) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Warehouse"),
        );
      else return null;
    }

    logger.info("exiting::getWarehouseByIdWoDTO::service");
    return warehouse;
  },

  async toggleActiveWarehouse(input: ToggleActive): Promise<WarehouseDTO> {
    logger.info("entering::toggleActiveWarehouse::service");
    await validateWarehouseId(input.id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    const updateWarehouse = await toggleActiveWarehouse(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updateWarehouse);
    }

    logger.info("exiting::toggleActiveWarehouse::service");
    const warehouseDTO = await toWarehouseDTO(updateWarehouse);
    return warehouseDTO;
  },
};
