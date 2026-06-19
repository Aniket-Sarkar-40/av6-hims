import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { ConsumptionCreateInput } from "@/types/consumption/consumption.js";
import { validateBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { validateStaffCollectionCenter } from "@/validations/service/master/collectionCenter.service.validation.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

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

    const name = existingItems.find((i) => i.id === detail.itemId)?.item;

    if (stock < consumedQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INSUFFICIENT_STOCK", `Item :${name}`)
      );
    }
  }
  logger.info("exiting::createConsumption::service::validation");
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
