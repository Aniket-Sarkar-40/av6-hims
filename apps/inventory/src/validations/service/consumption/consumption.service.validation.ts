import { getConsumptionByIdFromDb } from "@/repository/consumption/consumption.repository.js";
import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import {
  CommonConsumptionInput,
  ConsumptionApproveInput,
  ConsumptionCreateInput,
  ConsumptionUpdateInput,
} from "@/types/consumption/consumption.js";
import { validateBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { validateStaffCollectionCenter } from "@/validations/service/master/collectionCenter.service.validation.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdConsumption = async (consumptionId: number) => {
  logger.info("entering::validateIdConsumption::service::validation");
  validIdCheck(consumptionId);
  const consumption = await getConsumptionByIdFromDb(consumptionId);
  if (!consumption) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Consumption")
    );
  }
  logger.info("exiting::validateIdConsumption::service::validation");
  return consumption;
};

export const createConsumptionServiceValidation = async (
  input: ConsumptionCreateInput
) => {
  logger.info("entering::createConsumption::service::validation");

  await validateStaffCollectionCenter(input.requestedBy, input.ccId);

  await validateBranchOrWarehouse(input.ccId);

  const consumer = await employeeService.getEmployeeByIdFrmCacheOrDb(
    input.requestedBy,
    true
  );
  if (!consumer) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Requester"));
  }

  const itemIds = [...new Set(input.consumptionDetails.map((d) => d.itemId))];
  const existingItems = await getCountItemsFromDb(itemIds);

  if (existingItems.length !== itemIds.length) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Item"));
  }

  for (const detail of input.consumptionDetails) {
    const consumedQty = detail.consumedQty ?? detail.requestedQty;

    if (consumedQty > detail.requestedQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Approved qty ${consumedQty} is greater than requested qty ${detail.requestedQty}`
        )
      );
    }

    const stock = await getItemStockQtyByBatchWise({
      itemId: detail.itemId,
      batchNo: detail.isBatch && detail.batchNo ? detail.batchNo : null,
      userId: input.requestedBy,
      expiryDate:
        detail.isExpiry && detail.expiryDate
          ? new Date(detail.expiryDate)
          : null,
    });

    const name =
      existingItems.find((i) => i.id === detail.itemId)?.item ??
      `Item Id:${detail.itemId}`;

    if (!stock || stock < consumedQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INSUFFICIENT_STOCK", `Item :${name}`)
      );
    }
  }
  logger.info("exiting::createConsumption::service::validation");
};

export const updateConsumptionServiceValidation = async (
  input: ConsumptionUpdateInput
) => {
  logger.info("entering::updateConsumption::service::validation");
  const existing = await validateIdConsumption(input.id);
  input.existing = existing;

  if (existing.status !== "DRAFT") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Consumption")
    );
  }

  await createConsumptionServiceValidation(input);
};

export const approveConsumptionServiceValidation = async (
  input: ConsumptionApproveInput
) => {
  logger.info("entering::approveConsumption::service::validation");
  const existing = await validateIdConsumption(input.id);
  input.existing = existing;

  if (existing.status !== "SENT_FOR_APPROVAL") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Consumption")
    );
  }

  await validateBranchOrWarehouse(input.ccId);

  const consumer = await employeeService.getEmployeeByIdFrmCacheOrDb(
    input.requestedBy
  );
  if (!consumer) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Requester"));
  }

  /*---------------------Validate all itemIds exists---------------------------*/
  const itemIds = [...new Set(input.consumptionDetails.map((d) => d.itemId))];
  const existingItems = await getCountItemsFromDb(itemIds);

  if (existingItems.length !== itemIds.length) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Item"));
  }

  /*---------------------------------------------------------------------------*/
  /*--------------------- Validation of detail data----------------------------*/
  for (const detail of input.consumptionDetails) {
    // Check if item stock is available and sufficient
    const stock = await getItemStockQtyByBatchWise({
      itemId: detail.itemId,
      batchNo: detail.batchNo ? detail.batchNo : undefined,
      userId: input.requestedBy,
      expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : undefined,
      ccId: detail.ccId ?? null,
    });
    const name = existingItems.find((i) => i.id === detail.itemId)?.item;
    if (stock === undefined || stock < detail.consumedQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INSUFFICIENT_STOCK", `Item :${name}`)
      );
    }

    if (detail.consumedQty > detail.requestedQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Approved qty ${detail.consumedQty} is greater than requested qty ${detail.requestedQty}`
        )
      );
    }
  }

  logger.info("exiting::approveConsumption::service::validation");
};

export const rejectConsumptionServiceValidation = async (
  input: CommonConsumptionInput
) => {
  logger.info("entering::rejectConsumption::service::validation");

  const existing = await validateIdConsumption(input.id);

  if (existing.status === "REJECTED" || existing.status === "APPROVED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Consumption")
    );
  }

  logger.info("exiting::rejectConsumption::service::validation");
};

export const deleteConsumptionServiceValidation = async (
  input: CommonConsumptionInput
) => {
  logger.info("entering::deleteConsumption::service::validation");

  const existing = await validateIdConsumption(input.id);
  if (existing.requestedBy !== input.userId) {
    throw new ErrorHandler(400, generateErrorMessage("UNAUTHORIZED"));
  }
  if (existing.status !== "DRAFT") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Consumption")
    );
  }

  logger.info("exiting::deleteConsumption::service::validation");
};

export const getConsumptionByUserIdServiceValidation = async (
  userId: number
) => {
  logger.info("entering::getConsumptionByUserId::service::validation");
  const user = await employeeService.getEmployeeByIdFrmCacheOrDb(userId, true);
  if (!user) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "User"));
  }
  logger.info("exiting::getConsumptionByUserId::service::validation");
};
