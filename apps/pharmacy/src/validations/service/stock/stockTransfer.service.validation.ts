import { getCountItemsFromDb } from "@/repository/item/item.repository.js";
import { stockTransferValidationOperation } from "@/repository/stock/stock.repository.js";
import { getStockTransferById } from "@/repository/stock/stockTransfer.repository.js";
import {
  CreateItemStockTransferInput,
  StockTransferAcknowledgeInput,
  StockTransferUpdate,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";
import { validateIdEmployee } from "../staff/employee.service.validation.js";
import { getMappedItemIdsForBranch } from "@/repository/item/itemBranchMap.repository.js";
import {
  PMS_STR_RETURN_STATUS,
  PMS_STR_STATUS,
} from "@repo/db/generated/prisma/enums.js";

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
  const { items } = input;

  await validateIdEmployee(input.staffId);
  const wareHouse = await validateWarehouseId(input.ccId.id);
  input.warehouse = wareHouse;
  await validateIdBranch(input.from.id);
  await validateIdBranch(input.to.id);
  // await validateWarehouseId(data.from.id);
  // await validateWarehouseId(data.to.id);

  //if choose same brach for sending and reciving
  if (input.from.id === input.to.id) {
    throw new ErrorHandler(
      400,
      "Please choose different branch for sending and receiving",
    );
  }

  // Validate itemIds
  const itemIds = items.map((item) => item.itemId);
  const itemsInDb = await getCountItemsFromDb(itemIds);
  if (itemIds.length !== itemsInDb.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Items"));
  }

  const uniqueItemIds = [...new Set(itemIds)];

  const fromRows = await Promise.all([
    input.to.type === "branch"
      ? getMappedItemIdsForBranch(input.to.id, uniqueItemIds)
      : Promise.resolve([]),
  ]);

  const fromSet =
    input.from.type === "branch"
      ? new Set(fromRows[0].map((r) => r.itemId))
      : null;

  const unmappedIds = uniqueItemIds.filter((id) => fromSet && !fromSet.has(id));

  if (unmappedIds.length) {
    const names = unmappedIds
      .map(
        (id) => itemsInDb.find((x) => x.id === id)?.medicineName ?? `ID:${id}`,
      )
      .join(", ");
    throw new ErrorHandler(404, `Item Branch Map not found for: ${names}`);
  }

  // Validate stock quantity
  for (const item of items) {
    const fromStock = await stockTransferValidationOperation(input, item);

    if (!fromStock) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Item Id:${item.itemId} Stock`),
      );
    }

    // Validate quantity
    if (fromStock.quantity < item.quantity) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INSUFFICIENT_STOCK", `Item Id:${item.itemId} `),
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

  const updatedIds: number[] = input.items
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

  if (input.ccId.id !== st.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (st.status !== PMS_STR_STATUS.CREATED) {
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

  if (st.status !== PMS_STR_STATUS.CREATED) {
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
  if (st.status !== PMS_STR_STATUS.DISPATCHED) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }
  const updatedIds: number[] = input.items
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
  const { items } = input;

  for (const item of items) {
    const reqQty = stockTransferDetails.find((d) => item.id === d.id)?.quantity;
    if (!reqQty) {
      throw new ErrorHandler(
        400,
        `Item with id ${item.id} not found in stock transfer details`,
      );
    }
    if (item.quantity > reqQty) {
      throw new ErrorHandler(
        400,
        "Acknowledged quantity cannot be greater than dispatched quantity",
      );
    } else if (item.quantity < reqQty) {
      item.returnQuantity = reqQty - item.quantity;
      item.acknowledgedQuantity = item.quantity;
      input.status = PMS_STR_STATUS.PARTIALLY_ACKNOWLEDGED;
      input.returnStatus = PMS_STR_RETURN_STATUS.PENDING_RETURN;
    } else {
      item.acknowledgedQuantity = item.quantity;
      input.status = PMS_STR_STATUS.ACKNOWLEDGED;
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

  if (st.status !== PMS_STR_STATUS.CREATED) {
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
    st.status !== PMS_STR_STATUS.PARTIALLY_ACKNOWLEDGED &&
    st.returnStatus !== PMS_STR_RETURN_STATUS.PENDING_RETURN
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Stock Transfer"),
    );
  }

  logger.info("exiting::approveReturnStockTransfer::service::validation");
};
