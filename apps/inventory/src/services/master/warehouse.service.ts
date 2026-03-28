import { toWarehouseDTO } from "@/mapper/master/warehouse.mapper.js";
import {
  createWarehouseInDb,
  getAllWarehouseFromDb,
  getWarehouseByIdFromDb,
  toggleActiveWarehouse,
  updateWarehouseInDb,
  getWarehousesByCcIdsFromDb,
} from "@/repository/master/warehouse.repository.js";
import { ToggleActive } from "@/types/common.js";
import {
  WarehouseDTO,
  WarehouseReq,
  WarehouseResponse,
} from "@/types/master/warehouse.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createWarehouseServiceValidation,
  updateIdWarehouseServiceValidation,
  validateWarehouseId,
} from "@/validations/service/master/warehouse.service.validation.js";
import { InvWarehouse } from "@repo/db/generated/prisma/client";
import { WarehouseDTOLocation } from "@/types/master/warehouse.js";
import { toWarehouseDTOLocation } from "@/mapper/master/warehouse.mapper.js";
import { checkIsCacheable } from "@/config/cache.config.js";

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
    const warehouseDTO = await toWarehouseDTO([warehouse]);
    logger.info("exiting::createWarehouse::service");
    return warehouseDTO[0];
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
    const updatedWarehouseDTO = await toWarehouseDTO([updatedWarehouse]);
    return updatedWarehouseDTO[0];
  },

  async getAllWarehouse(
    canNullReturnable: boolean = false,
  ): Promise<WarehouseDTO[]> {
    logger.info("entering::getAllWarehouse::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    let warehouse: WarehouseResponse[];
    if (isCacheable) {
      warehouse = (await getAllCache(cacheKey)) as WarehouseResponse[];
    } else {
      warehouse = await getAllWarehouseFromDb();
    }
    if (warehouse.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Warehouse"),
        );
      else return [];
    }
    const warehouseDTO = await toWarehouseDTO(warehouse);
    logger.info("exiting::getAllWarehouse::service");
    return warehouseDTO;
  },

  async getWarehouseById(
    warehouseId: number,
    canNullReturnable: boolean = false,
  ): Promise<WarehouseDTO | null> {
    logger.info("entering::getWarehouseById::service");
    validIdCheck(warehouseId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    let warehouse: WarehouseResponse | null;
    let warehouseDTO = null;

    if (isCacheable) {
      warehouse = (await getCacheById(
        cacheKey,
        warehouseId,
      )) as WarehouseResponse | null;

      if (warehouse !== null) {
        warehouseDTO = await toWarehouseDTO([warehouse]);
      }
    } else {
      warehouse = await getWarehouseByIdFromDb(warehouseId);

      if (warehouse !== null) {
        warehouseDTO = await toWarehouseDTO([warehouse]);
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
    return warehouseDTO[0];
  },

  async getWarehouseByIdWoDTO(
    warehouseId: number,
    canNullReturnable: boolean = false,
  ): Promise<InvWarehouse | null> {
    logger.info("entering::getWarehouseById::service");
    validIdCheck(warehouseId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.WAREHOUSE);
    let warehouse: InvWarehouse | null;

    if (isCacheable) {
      warehouse = (await getCacheById(
        cacheKey,
        warehouseId,
      )) as InvWarehouse | null;
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

    logger.info("exiting::getWarehouseById::service");
    return warehouse;
  },

  async toggleActiveWarehouse(input: ToggleActive): Promise<WarehouseDTO> {
    logger.info("entering::reactivateWarehouse::service");
    await validateWarehouseId(input.id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    const updateWarehouse = await toggleActiveWarehouse(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updateWarehouse);
    }

    logger.info("exiting::reactivateWarehouse::service");
    const warehouseDTO = await toWarehouseDTO([updateWarehouse]);
    return warehouseDTO[0];
  },

  async getWarehousesByCcIds(ccIds: number[]): Promise<WarehouseDTO[]> {
    logger.info("entering::getWarehousesByCcIds::service");
    if (!ccIds.length) return [];

    const warehouses = await getWarehousesByCcIdsFromDb(ccIds);
    const dtos = await toWarehouseDTO(warehouses);

    logger.info("exiting::getWarehousesByCcIds::service");
    return dtos;
  },

  async getWarehousesByCcIdsAsLocation(
    ccIds: number[],
  ): Promise<WarehouseDTOLocation[]> {
    logger.info("entering::getWarehousesByCcIdsAsLocation::service");
    if (!ccIds.length) return [];

    const warehouses = await getWarehousesByCcIdsFromDb(ccIds);
    const dtos = await Promise.all(
      warehouses.map((w) => toWarehouseDTOLocation(w)),
    );

    logger.info("exiting::getWarehousesByCcIdsAsLocation::service");
    return dtos;
  },
};
