import { toStockAdjustmentDTO } from "@/mapper/stock/stockAdjustment.mapper";
import { createStockAdjustmentInDb, updateStockAdjustmentInDb } from "@/repository/stock/stockAdjustment.repository";
import { CreateStockAjustmentInput, UpdateStockAjustmentInput } from "@/types/stock/stockAdjustment";
import { logger } from "@/utils/logger.utils";
import {
  createStockAdjustmentServiceValidation,
  updateStockAdjustmentServiceValidation,
  validateIdStockAdjustment,
} from "@/validations/service/stock/stockAdjustment.service.validation";

export const stockAdjustmentService = {
  async createStockAdjustment(input: CreateStockAjustmentInput) {
    logger.info("entering::createStockAdjustment::service");
    const availQtyMismatch = await createStockAdjustmentServiceValidation(input);
    if (availQtyMismatch && availQtyMismatch.length > 0) return availQtyMismatch;
    const result = await createStockAdjustmentInDb(input);
    logger.info("exiting::createStockAdjustment::service");
    return result;
  },

  async updateStockAdjustment(input: UpdateStockAjustmentInput) {
    logger.info("entering::updateStockAdjustment::service");
    const availQtyMismatch = await updateStockAdjustmentServiceValidation(input);
    if (availQtyMismatch && availQtyMismatch.length > 0) return availQtyMismatch;
    const result = await updateStockAdjustmentInDb(input);
    logger.info("exiting::updateStockAdjustment::service");
    return result;
  },

  async getStockAdjustmentById(id: number) {
    logger.info("entering::getStockAdjustmentById::service");
    const record = await validateIdStockAdjustment(id);
    logger.info("exiting::getStockAdjustmentById::service");
    return await toStockAdjustmentDTO(record);
  },
};
