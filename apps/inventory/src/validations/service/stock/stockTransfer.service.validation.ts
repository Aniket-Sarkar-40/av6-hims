import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import {
  CreateItemStockTransferInput,
  StockTransferAcknowledgeInput,
  StockTransferUpdate,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";
import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  ST_RETURN_STATUS,
  ST_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { getStockTransferById } from "@/repository/stock/stockTransfer.repository.js";
import { settingsService } from "@/services/master/settings.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const validateStockTransferId = async (id: number) => {
  logger.info("entering::validateStockTransferId::service::validation");
  validIdCheck(id);
  const st = await getStockTransferById(id);
  if (!st) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Stock Transfer"),
    );
  }
  logger.info("exiting::validateStockTransferId::service::validation");
  return st;
};
export const createStockTransferServiceValidation = async (
  input: CreateItemStockTransferInput,
): Promise<void> => {
  logger.info("entering::createStockTransfer::service::validation");

  const { stockTransferDetails } = input;
  const settings = await settingsService.getSettings();
  const warehouseMode = settings?.warehouseMode;

  const staff = await employeeService.getEmployeeByIdFrmCacheOrDb(
    input.staffId,
  );

  if (!staff) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Staff"));
  }

  if (warehouseMode) {
    await validateWarehouseId(input.ccId);
  } else {
    const branch = await validateIdBranch(input.ccId);

    if (!branch.isMain) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("ACCESS_FAIL", "Switch To Main Branch"),
      );
    }
  }

  await validateIdBranch(input.fromId);
  await validateIdBranch(input.toId);

  if (input.fromId === input.toId) {
    throw new ErrorHandler(
      400,
      "Please choose different branch for sending and receiving",
    );
  }

  const itemIds = [...new Set(stockTransferDetails.map((item) => item.itemId))];

  const itemsInDb = await getCountItemsFromDb(itemIds);

  if (itemIds.length !== itemsInDb.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Items"));
  }

  for (const item of stockTransferDetails) {
    const fromStock = await getItemStockQtyByBatchWise({
      itemId: item.itemId,
      batchNo: item.batchNo || null,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      ccId: input.fromId,
    });

    const itemName =
      itemsInDb.find((i) => i.id === item.itemId)?.item ??
      `Item Id:${item.itemId}`;

    if (!fromStock) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `${itemName} Stock`),
      );
    }

    if (fromStock < (item.quantity ?? 0)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INSUFFICIENT_STOCK", itemName),
      );
    }
  }

  logger.info("exiting::createStockTransfer::service::validation");
};

export const updateStockTransferServiceValidation = async (
  input: UpdateItemStockTransferInput,
): Promise<void> => {
  logger.info(
    "entering::updateStockTransferServiceValidation::service::validation",
  );

  const st = await validateStockTransferId(input.id);
  input.stockTransfer = st;

  const updatedIds: number[] = input.stockTransferDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in stock transfer details
  const existingIds = st.stockTransferDetails.map((item) => item.id);
  // check if any item is not in stock transfer details
  const notInStockTransferDetails = updatedIds.filter(
    (id) => !existingIds.includes(id),
  );
  if (notInStockTransferDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        `Id ${notInStockTransferDetails.join(", ")} of Stock Transfer Details`,
      ),
    );
  }

  if (input.ccId !== st.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (st.status !== ST_STATUS.CREATED) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }

  await createStockTransferServiceValidation(input);

  logger.info(
    "exiting::updateStockTransferServiceValidation::service::validation",
  );
};

export const approveStockTransferServiceValidation = async (
  input: StockTransferUpdate,
): Promise<void> => {
  logger.info("entering::approveStockTransfer::service::validation");
  const st = await validateStockTransferId(input.id);
  //Write condition for check unauthorized access
  if (st.fromId !== input.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (st.status !== ST_STATUS.CREATED) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }

  logger.info("exiting::approveStockTransfer::service::validation");
};

export const acknowledgeStockTransferServiceValidation = async (
  input: StockTransferAcknowledgeInput,
): Promise<void> => {
  logger.info("entering::acknowledgeStockTransfer::service::validation");
  await validateIdBranch(input.ccId);
  const st = await validateStockTransferId(input.id);
  input.stockTransfer = st;

  //Write condition for check unauthorized access
  if (st.toId !== input.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }
  if (st.status !== ST_STATUS.DISPATCHED) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }
  const updatedIds: number[] = input.stockTransferDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in stock transfer details
  const existingIds = st.stockTransferDetails.map((item) => item.id);
  // check if any item is not in stock transfer details
  const notInStockTransferDetails = updatedIds.filter(
    (id) => !existingIds.includes(id),
  );
  if (notInStockTransferDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        `Id ${notInStockTransferDetails.join(", ")} of Stock Transfer Details`,
      ),
    );
  }

  const { stockTransferDetails } = st;
  // await createStockTransferServiceValidation(input);
  const { stockTransferDetails: stockTransferDetailsInput } = input;

  for (const item of stockTransferDetailsInput) {
    const reqQty = stockTransferDetails.find((d) => item.id === d.id)?.quantity;
    if (!reqQty) {
      throw new ErrorHandler(
        400,
        `Item with id ${item.id} not found in stock transfer details`,
      );
    }
    if ((item.quantity ?? 0) > reqQty) {
      throw new ErrorHandler(
        400,
        "Acknowledged quantity cannot be greater than dispatched quantity",
      );
    } else if ((item.quantity ?? 0) < reqQty) {
      item.returnQuantity = reqQty - (item.quantity ?? 0);
      item.acknowledgedQuantity = item.quantity;
      input.status = ST_STATUS.PARTIALLY_ACKNOWLEDGED;
      input.returnStatus = ST_RETURN_STATUS.PENDING_RETURN;
    } else {
      item.acknowledgedQuantity = item.quantity;
      input.status = ST_STATUS.ACKNOWLEDGED;
    }
  }

  logger.info("exiting::acknowledgeStockTransfer::service::validation");
};

export const deleteStockTransferServiceValidation = async (
  input: StockTransferUpdate,
): Promise<void> => {
  logger.info(
    "entering::deleteStockTransferServiceValidation::service::validation",
  );
  const st = await validateStockTransferId(input.id);
  //Write condition for check unauthorized access
  if (input.ccId !== st.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (st.status !== ST_STATUS.CREATED) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }

  logger.info(
    "exiting::deleteStockTransferServiceValidation::service::validation",
  );
};
export const approveReturnStockTransferServiceValidation = async (
  input: StockTransferUpdate,
): Promise<void> => {
  logger.info("entering::approveReturnStockTransfer::service::validation");
  const st = await validateStockTransferId(input.id);
  //Write condition for check unauthorized access
  if (st.fromId !== input.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (
    st.status !== ST_STATUS.PARTIALLY_ACKNOWLEDGED &&
    st.returnStatus !== ST_RETURN_STATUS.PENDING_RETURN
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }

  logger.info("exiting::approveReturnStockTransfer::service::validation");
};
