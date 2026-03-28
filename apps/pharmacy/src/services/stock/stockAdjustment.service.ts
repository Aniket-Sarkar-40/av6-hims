import { toStockAdjustmentDTO } from "@/mapper/stock/stockAdjustment.mapper.js";
import {
  CreateStockAjustmentInput,
  UpdateStockAjustmentInput,
} from "@/types/stock/stockAdjustment.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createStockAdjustmentServiceValidation,
  updateExpiryServiceValidation,
  updateStockAdjustmentServiceValidation,
  validateIdStockAdjustment,
} from "@/validations/service/stock/stockAdjustment.service.validation.js";
import {
  createStockAdjustmentInDb,
  updateStockAdjustmentInDb,
} from "../../repository/stock/stockAdjustment.repository.js";
import { updateBatchExpiryInput } from "@/types/stock/stock.js";
import { updateBatchExpiry } from "@/repository/stock/stock.repository.js";

export const stockAdjustmentService = {
  async createStockAdjustment(input: CreateStockAjustmentInput) {
    logger.info("entering::createStockAdjustment::service");
    const availQtyMistmatch =
      await createStockAdjustmentServiceValidation(input);
    if (availQtyMistmatch && availQtyMistmatch.length > 0)
      return availQtyMistmatch;
    const record = await createStockAdjustmentInDb(input);
    logger.info("exiting::createStockAdjustment::service");
    return record;
  },
  async updateStockAdjustment(input: UpdateStockAjustmentInput) {
    logger.info("entering::updateStockAdjustment::service");
    const availQtyMistmatch =
      await updateStockAdjustmentServiceValidation(input);
    if (availQtyMistmatch && availQtyMistmatch.length > 0)
      return availQtyMistmatch;
    const record = await updateStockAdjustmentInDb(input);
    logger.info("exiting::updateStockAdjustment::service");
    return record;
  },
  async getStockAdjustmentById(id: number) {
    logger.info("entering::getStockAdjustmentById::service");
    const record = await validateIdStockAdjustment(id);
    logger.info("exiting::getStockAdjustmentById::service");
    return await toStockAdjustmentDTO(record);
  },
  async updateBatchExpiry(input: updateBatchExpiryInput) {
    logger.info("entering::updateBatchExpiry::service");
    await updateExpiryServiceValidation(input);
    await updateBatchExpiry(input);
    logger.info("exiting::updateBatchExpiry::service");
    return true;
  },
};
