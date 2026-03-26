import { toStockAdjustmentDTO } from "@/mapper/stock/stockAdjustment.mapper.js";
import {
  createStockAdjustmentInDb,
  updateStockAdjustmentInDb,
} from "@/repository/stock/stockAdjustment.repository.js";
import {
  CreateStockAjustmentInput,
  UpdateStockAjustmentInput,
} from "@/types/stock/stockAdjustment.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createStockAdjustmentServiceValidation,
  updateStockAdjustmentServiceValidation,
  validateIdStockAdjustment,
} from "@/validations/service/stock/stockAdjustment.service.validation.js";

export const stockAdjustmentService = {
  async createStockAdjustment(input: CreateStockAjustmentInput) {
    logger.info("entering::createStockAdjustment::service");
    const availQtyMismatch =
      await createStockAdjustmentServiceValidation(input);
    if (availQtyMismatch && availQtyMismatch.length > 0)
      return availQtyMismatch;
    const result = await createStockAdjustmentInDb(input);
    logger.info("exiting::createStockAdjustment::service");
    return result;
  },

  async updateStockAdjustment(input: UpdateStockAjustmentInput) {
    logger.info("entering::updateStockAdjustment::service");
    const availQtyMismatch =
      await updateStockAdjustmentServiceValidation(input);
    if (availQtyMismatch && availQtyMismatch.length > 0)
      return availQtyMismatch;
    const result = await updateStockAdjustmentInDb(input);
    logger.info("exiting::updateStockAdjustment::service");
    return result;
  },

  async getStockAdjustmentById(id: number) {
    logger.info("entering::getStockAdjustmentById::service");
    const record = await validateIdStockAdjustment(id);
    const dto = await toStockAdjustmentDTO([record]);
    logger.info("exiting::getStockAdjustmentById::service");
    return dto[0];
  },
};
