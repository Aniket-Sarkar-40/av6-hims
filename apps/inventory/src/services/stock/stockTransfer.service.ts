import { toStockTransferDTO } from "@/mapper/stock/stockTransfer.mapper.js";
import {
  acknowledgeStockTransfer,
  approveReturnStockTransfer,
  approveStockTransfer,
  createStockTransfer,
  deleteStockTransfer,
  getAllStockTransfer,
  searchStockTransfers,
  updateStockTransfer,
} from "@/repository/stock/stockTransfer.repository.js";
import { PaginatedResponse } from "@/types/common.js";
import {
  CreateItemStockTransferInput,
  StockTransferAcknowledgeInput,
  StockTransferDTO,
  StockTransferSearchInput,
  StockTransferUpdate,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";
import {
  acknowledgeStockTransferServiceValidation,
  approveReturnStockTransferServiceValidation,
  approveStockTransferServiceValidation,
  createStockTransferServiceValidation,
  deleteStockTransferServiceValidation,
  updateStockTransferServiceValidation,
  validateStockTransferId,
} from "@/validations/service/stock/stockTransfer.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

export const stockTransferService = {
  async createStockTransfer(
    input: CreateItemStockTransferInput,
  ): Promise<StockTransferDTO> {
    logger.info("entering::createStockTransfer::service");
    await createStockTransferServiceValidation(input);
    const stockTransfer = await createStockTransfer(input);
    const stockTransferDTO = await toStockTransferDTO([stockTransfer]);
    logger.info("exiting::createStockTransfer::service");
    return stockTransferDTO[0];
  },

  async updateStockTransfer(
    input: UpdateItemStockTransferInput,
  ): Promise<StockTransferDTO> {
    logger.info("entering::updateStockTransfer::service");
    await updateStockTransferServiceValidation(input);
    const stockTransfer = await updateStockTransfer(input);
    const stockTransferDTO = await toStockTransferDTO([stockTransfer]);
    logger.info("exiting::updateStockTransfer::service");
    return stockTransferDTO[0];
  },

  async deleteStockTransfer(input: StockTransferUpdate): Promise<void> {
    logger.info("entering::deleteStockTransfer::service");
    await deleteStockTransferServiceValidation(input);
    await deleteStockTransfer(input.id);
    logger.info("exiting::deleteStockTransfer::service");
  },

  async approveStockTransfer(
    input: StockTransferUpdate,
  ): Promise<StockTransferDTO> {
    logger.info("entering::approveStockTransfer::service");
    await approveStockTransferServiceValidation(input);
    const stockTransfer = await approveStockTransfer(input);
    const stockTransferDTO = await toStockTransferDTO([stockTransfer]);
    logger.info("exiting::approveStockTransfer::service");
    return stockTransferDTO[0];
  },
  async approveReturnStockTransfer(
    input: StockTransferUpdate,
  ): Promise<StockTransferDTO> {
    logger.info("entering::approveReturnStockTransfer::service");
    await approveReturnStockTransferServiceValidation(input);
    const stockTransfer = await approveReturnStockTransfer(input);
    const stockTransferDTO = await toStockTransferDTO([stockTransfer]);
    logger.info("exiting::approveReturnStockTransfer::service");
    return stockTransferDTO[0];
  },

  async acknowledgeStockTransfer(
    input: StockTransferAcknowledgeInput,
  ): Promise<StockTransferDTO> {
    logger.info("entering::acknowledgeStockTransfer::service");
    await acknowledgeStockTransferServiceValidation(input);
    const stockTransfer = await acknowledgeStockTransfer(input);
    const stockTransferDTO = await toStockTransferDTO([stockTransfer]);
    logger.info("exiting::acknowledgeStockTransfer::service");
    return stockTransferDTO[0];
  },

  async getStockTransferById(id: number): Promise<StockTransferDTO> {
    logger.info("entering::getStockTransferById::service");
    const stockTransfer = await validateStockTransferId(id);
    const stockTransferDTO = await toStockTransferDTO([stockTransfer]);
    logger.info("exiting::getStockTransferById::service");
    return stockTransferDTO[0];
  },

  async getAllStockTransfer(): Promise<StockTransferDTO[]> {
    logger.info("entering::getAllStockTransfer::service");
    const stockTransfer = await getAllStockTransfer();
    const stockTransferDTOs = await toStockTransferDTO(stockTransfer);
    logger.info("exiting::getAllStockTransfer::service");
    return stockTransferDTOs;
  },
  async searchStockTransfers(
    input: StockTransferSearchInput,
  ): Promise<PaginatedResponse<StockTransferDTO>> {
    logger.info("entering::searchStockTransfers::service");

    const { data: rawData, total } = await searchStockTransfers(input);

    const data = await toStockTransferDTO(rawData);

    const { pageNo, pageSize } = input;
    const lastPageNumber = Math.max(1, Math.ceil(total / pageSize));

    logger.info("exiting::searchStockTransfers::service");

    return {
      data,
      totalRecords: total,
      currentPageNumber: pageNo,
      pageSize,
      lastPageNumber,
    };
  },
};
