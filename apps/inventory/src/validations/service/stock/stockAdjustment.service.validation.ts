import { getItemStockByItemOnly } from "@/repository/stock/stock.repository.js";
import { getStockAdjustmentByIdFromDb } from "@/repository/stock/stockAdjustment.repository.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  CreateStockAjustmentInput,
  StockAdjustmentMismatchAvailQtyDTO,
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
  InvStockAdjustmentStatus,
} from "@repo/db/generated/prisma/client";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";
import { settingsService } from "@/services/master/settings.service.js";

export const validateIdStockAdjustment = async (
  id: number
): Promise<StockAdjustmentResponse> => {
  logger.info("entering::validateIdStockAdjustment::service::validation");
  validIdCheck(id);

  const record = await getStockAdjustmentByIdFromDb(id);
  if (!record) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Stock Adjustment")
    );
  }
  logger.info("exiting::validateIdStockAdjustment::service::validation");
  return record;
};

export const validateStockAdjustmentCollectionCenters = async (
  ccId: number,
  targetCcId: number
) => {
  const settings = await settingsService.getSettings(true);
  const warehouseMode = settings?.warehouseMode;

  if (ccId === targetCcId) {
    if (warehouseMode) {
      const warehouse = await validateWarehouseId(ccId);
      return { sourceCc: warehouse, targetCc: warehouse };
    } else {
      const branch = await validateIdBranch(ccId);
      return { sourceCc: branch, targetCc: branch };
    }
  }

  if (warehouseMode) {
    const sourceCc = await validateWarehouseId(ccId);
    const targetCc = await validateIdBranch(targetCcId);

    return { sourceCc, targetCc };
  }

  const sourceCc = await validateIdBranch(ccId);
  const targetCc = await validateIdBranch(targetCcId);

  if (!sourceCc.isMain) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("ACCESS_FAIL", "Switch To Main Branch")
    );
  }

  return { sourceCc, targetCc };
};

export const createStockAdjustmentServiceValidation = async (
  input: CreateStockAjustmentInput
) => {
  logger.info("entering::createStockAdjustment::service::validation");

  await validateStockAdjustmentCollectionCenters(input.ccId, input.targetCcId);

  const availQtyMismatchResult = await commonStockAdjustmentServiceValidation(
    input
  );

  logger.info("exiting::createStockAdjustment::service::validation");

  return availQtyMismatchResult;
};

export const updateStockAdjustmentServiceValidation = async (
  input: UpdateStockAjustmentInput
) => {
  logger.info("entering::updateStockAdjustment::service::validation");
  const existing = await validateIdStockAdjustment(input.id);
  if (existing.status !== InvStockAdjustmentStatus.DRAFT) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Adjustment")
    );
  }
  input.existing = existing;

  if (input.ccId !== existing.ccId)
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  if (input.targetCcId !== existing.targetCcId)
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  const availQtyMismatchResult = await commonStockAdjustmentServiceValidation(
    input
  );
  logger.info("exiting::updateStockAdjustment::service::validation");
  return availQtyMismatchResult;
};

export const commonStockAdjustmentServiceValidation = async (
  input: CreateStockAjustmentInput | UpdateStockAjustmentInput
) => {
  logger.info("entering::commonStockAdjustment::service::validation");
  const { stockAdjustmentDetails } = input as {
    stockAdjustmentDetails: UpdateStockAdjustmentDetailsInput[];
  };
  const itemIds = [...new Set(stockAdjustmentDetails.map((d) => d.itemId))];
  const items = await itemMasterService.getAllItemMasterWoDto();
  const itemsNotFound = itemIds.filter(
    (id) => !items.some((item) => item.id === id)
  );
  if (itemsNotFound.length > 0) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", `Item Id: ${itemsNotFound.join(", ")}`)
    );
  }

  const availQtyMismatchResult: StockAdjustmentMismatchAvailQtyDTO[] = [];
  for (const detail of stockAdjustmentDetails) {
    if (detail.id) {
      const { existing } = input as UpdateStockAjustmentInput;
      const exist = existing.stockAdjustmentDetails.find(
        (d) => d.id === detail.id
      );
      if (!exist) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Stock adjustment details with id: ${detail.id} does not exist in stock adjustment with id: ${input.id}`
          )
        );
      }
    }
    let index = 1;
    const item = items.find((item) => item.id === detail.itemId)!;
    const stock = await getItemStockByItemOnly(
      detail.itemId,
      input.targetCcId,
      detail.batchNo,
      detail.expiryDate ? new Date(detail.expiryDate) : undefined,
      !!detail.isFoc,
      detail.batchId ?? undefined
    );
    if (!stock) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "NOT_FOUND",
          `Stock of Item: ${item.item}, Batch:${detail.batchNo}, Expiry:${
            detail.expiryDate
          }, Foc:${detail.isFoc ?? false} in row no: ${index}`
        )
      );
    }
    if (stock.id !== detail.batchId) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "MISMATCH",
          `Provided batch id: ${
            detail.batchId
          } does not match with stock  of Item: ${item.item}, Batch:${
            detail.batchNo
          }, Expiry:${detail.expiryDate}, Foc:${
            detail.isFoc ?? false
          }  in row no: ${index}`
        )
      );
    }
    if (input.isAvailQtyCheck && stock.quantity !== detail.availableQty) {
      availQtyMismatchResult.push({
        rowNo: index,
        itemId: detail.itemId,
        itemName: item?.item ?? "",
        itemCode: item.itemCode ?? "",
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
            `Item:${item.item}, Batch:${detail.batchNo}, Expiry:${
              detail.expiryDate
            }, Foc:${detail.isFoc ?? false}, Qty:${
              detail.quantity
            } in row no:${index}`
          )
        );
      }
    }

    index++;
  }
  logger.info("exiting::commonStockAdjustment::service::validation");
  if (availQtyMismatchResult.length > 0) {
    return availQtyMismatchResult;
  }
};
