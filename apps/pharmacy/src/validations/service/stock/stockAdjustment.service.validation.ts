import {
  getItemStockByItemOnly,
  getStockInfo,
  getStocksByIds,
} from "@/repository/stock/stock.repository.js";
import { getStockAdjustmentByIdFromDb } from "@/repository/stock/stockAdjustment.repository.js";
import {
  CreateStockAjustmentInput,
  StockAdjustmentMistmatchAvailQtyDTO,
  StockAdjustmentResponse,
  UpdateStockAdjustmentDetailsInput,
  UpdateStockAjustmentInput,
} from "@/types/stock/stockAdjustment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  Action,
  STOCK_ADJUSTMENT_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";
import {
  TransferableStockInp,
  updateBatchExpiryInput,
} from "@/types/stock/stock.js";
import { itemService } from "@/services/item/item.service.js";

export const validateIdStockAdjustment = async (
  id: number,
): Promise<StockAdjustmentResponse> => {
  logger.info("entering::validateIdStockAdjustment::service::validation");
  validIdCheck(id);

  const record = await getStockAdjustmentByIdFromDb(id);
  if (!record) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Stock Adjustment"),
    );
  }
  logger.info("exiting::validateIdStockAdjustment::service::validation");
  return record;
};

export const commonStockAdjustmentServiceValidation = async (
  input: CreateStockAjustmentInput | UpdateStockAjustmentInput,
) => {
  logger.info("entering::commonStockAdjustment::service::validation");
  const { stockAdjustmentDetails } = input as {
    stockAdjustmentDetails: UpdateStockAdjustmentDetailsInput[];
  };
  const itemIds = [...new Set(stockAdjustmentDetails.map((d) => d.itemId))];
  const items = await itemService.getAllItemWoDto();
  const itemsNotFound = itemIds.filter(
    (id) => !items.some((item) => item.id === id),
  );
  if (itemsNotFound.length > 0) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", `Item Id: ${itemsNotFound.join(", ")}`),
    );
  }

  const availQtyMistmatchResult: StockAdjustmentMistmatchAvailQtyDTO[] = [];
  for (const detail of stockAdjustmentDetails) {
    if (detail.id) {
      const { existing } = input as UpdateStockAjustmentInput;
      const exist = existing.stockAdjustmentDetails.find(
        (d) => d.id === detail.id,
      );
      if (!exist) {
        throw new ErrorHandler(
          404,
          `Stock adjustment details with id: ${detail.id} does not exist in stock adjustment with id: ${input.id}`,
        );
      }
    }
    let index = 1;
    const item = items.find((item) => item.id === detail.itemId)!;
    const stock = await getItemStockByItemOnly(
      detail.itemId,
      {
        warehouseId: input.warehouseId ?? undefined,
        branchId: input.branchId ?? undefined,
      },
      detail.batchNo,
      detail.expiryDate ? new Date(detail.expiryDate) : undefined,
      !!detail.isFoc,
    );
    if (!stock) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "NOT_FOUND",
          `Stock of Item: ${item.medicineName}, Batch:${detail.batchNo}, Expiry:${detail.expiryDate}, Foc:${detail.isFoc ?? false} in row no: ${index}`,
        ),
      );
    }
    if (stock.id !== detail.batchId) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "MISMATCH",
          `Provided batch id: ${detail.batchId} does not match with stock  of Item: ${item.medicineName}, Batch:${detail.batchNo}, Expiry:${detail.expiryDate}, Foc:${detail.isFoc ?? false}  in row no: ${index}`,
        ),
      );
    }
    if (input.isAvailQtyCheck && stock.quantity !== detail.availableQty) {
      availQtyMistmatchResult.push({
        rowNo: index,
        itemId: detail.itemId,
        itemName: item?.medicineName ?? "",
        itemCode: item.itemNumber ?? "",
        exptAvailQty: detail.availableQty ?? 0,
        actlAvailQty: stock.quantity,
        adjustType: detail.adjustType,
        quantity: detail.quantity,
        batchId: detail.batchId,
      });
    }
    if (detail.adjustType === Action.SUBTRACTION) {
      if (!stock || stock.quantity < detail.quantity) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Item:${item.medicineName}, Batch:${detail.batchNo}, Expiry:${detail.expiryDate}, Foc:${detail.isFoc ?? false}, Qty:${detail.quantity} in row no:${index}`,
          ),
        );
      }
    }

    index++;
  }
  logger.info("exiting::commonStockAdjustment::service::validation");
  if (availQtyMistmatchResult.length > 0) {
    return availQtyMistmatchResult;
  }
};

export const createStockAdjustmentServiceValidation = async (
  input: CreateStockAjustmentInput,
) => {
  logger.info("entering::createStockAdjustment::service::validation");

  await validateWarehouseId(input.ccId);
  if (input.warehouseId) await validateWarehouseId(input.warehouseId);
  if (input.branchId) await validateIdBranch(input.branchId);

  const availQtyMistmatchResult =
    await commonStockAdjustmentServiceValidation(input);

  logger.info("exiting::createStockAdjustment::service::validation");

  return availQtyMistmatchResult;
};

export const updateStockAdjustmentServiceValidation = async (
  input: UpdateStockAjustmentInput,
) => {
  logger.info("entering::createStockAdjustment::service::validation");
  const existing = await validateIdStockAdjustment(input.id);
  if (existing.status !== STOCK_ADJUSTMENT_STATUS.DRAFT) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Adjustment"),
    );
  }
  input.existing = existing;

  if (input.ccId !== existing.ccId)
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  if (input.warehouseId && input.warehouseId !== existing.warehouseId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Warehouse Id", "Existing Warehouse Id"),
    );
  }
  if (input.branchId && input.branchId !== existing.branchId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Branch Id", "Existing Branch Id"),
    );
  }
  const availQtyMistmatchResult =
    await commonStockAdjustmentServiceValidation(input);
  logger.info("exiting::createStockAdjustment::service::validation");
  return availQtyMistmatchResult;
};

export const updateExpiryServiceValidation = async (
  input: updateBatchExpiryInput,
) => {
  logger.info("entering::updateExpiryServiceValidation::service::validation");
  const itemStocks = await getStocksByIds(input.ids);

  if (itemStocks.length !== input.ids.length) {
    const notPresentIds = input.ids.filter(
      (id) => !itemStocks.some((item) => item.id === id),
    );
    throw new ErrorHandler(
      404,
      generateErrorMessage(
        "NOT_FOUND",
        `Item Stock of ids - ${notPresentIds.join(", ")}`,
      ),
    );
  }

  const transferableStock: TransferableStockInp[] = [];
  const updateExpIds: number[] = [];

  for (const stock of itemStocks) {
    if (stock.expiryDate?.toISOString() === input.newExp.toISOString()) {
      continue;
    }
    const itemStockDup = await getStockInfo({
      itemId: stock.itemId,
      branchId: stock.branchId ?? undefined,
      warehouseId: stock.warehouseId ?? undefined,
      batchNo: stock.batchNo ?? undefined,
      expiryDate: input.newExp,
      isFoc: stock.isFoc,
      notInIds: [stock.id],
    });

    if (itemStockDup) {
      transferableStock.push({
        fromStock: stock,
        toStock: itemStockDup,
      });
    } else {
      updateExpIds.push(stock.id);
    }
  }
  input.updateExpIds = updateExpIds;
  input.transferableStock = transferableStock;
  logger.info("exiting::updateExpiryServiceValidation::service::validation");
};
