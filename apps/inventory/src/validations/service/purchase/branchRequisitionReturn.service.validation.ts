import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import {
  getBranchItemDetailsFromDb,
  getBranchRequisitionBatchWiseFromDb,
  validateBranchRequisitionByIdFromDb,
} from "@/repository/purchase/branchRequisition.repository.js";
import {
  getBranchRequisitionReturnByIdFromDb,
  getPendingBRRFromBRId,
} from "@/repository/purchase/branchRequisitionReturn.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { settingsService } from "@/services/master/settings.service.js";
import {
  AcknowledgeBranchRequisitionReturn,
  ApproveBranchReqReturnInput,
  CreateBranchRequisitionReturnInput,
  RejectBranchRequisitionReturnInput,
} from "@/types/purchase/branchRequisitionReturn.js";
import { validateIdBranch } from "@/validations/service/master/branch.service.validation.js";
import { validateWarehouseId } from "@/validations/service/master/warehouse.service.validation.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { STORE_REQ_STATUS } from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  ensureMatch,
  generateErrorMessage,
} from "@repo/shared/utils/responseMessage.utils.js";

const validateWarehouseModeEnabled = async (): Promise<void> => {
  const store = requestStorage.getStore();
  const settings = await settingsService.getSettings();
  const isWarehouseModeEnabled = settings?.warehouseMode;

  if (!isWarehouseModeEnabled) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Warehouse mode is not enabled")
    );
  }
};

export const validateIdBranchRequisitionReturn = async (id: number) => {
  logger.info(
    "entering::validateIdBranchRequisitionReturn::service::validation"
  );

  validIdCheck(id);

  const brr = await getBranchRequisitionReturnByIdFromDb(id);

  if (!brr) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Branch Requisition Return")
    );
  }

  logger.info(
    "exiting::validateIdBranchRequisitionReturn::service::validation"
  );
  return brr;
};

export const validateBranchRequisitionReturnCommon = async (
  body: CreateBranchRequisitionReturnInput
) => {
  logger.info(
    "entering::validateBranchRequisitionReturnCommon::service::validation"
  );

  validateWarehouseModeEnabled();

  await validateIdBranch(body.branchId);

  const user = await employeeService.getEmployeeByIdFrmCacheOrDb(
    body.requisitionFrom
  );
  if (!user) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Employee"));
  }

  const pendingBRR = await getPendingBRRFromBRId(body.branchRequisitionId);
  if (pendingBRR.length > 0) {
    if (!body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
      );
    }
    const isAnyPendingReturn = pendingBRR.some((brr) => brr.id !== body.id);
    if (isAnyPendingReturn) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
      );
    }
  }

  if (body.returnStatus && body.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
    );
  }

  const itemIds = Array.from(new Set(body.returnItems.map((d) => d.itemId)));
  const items = await getCountItemsFromDb(itemIds);
  if (items.length !== itemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  const branchReq = await validateBranchRequisitionByIdFromDb(
    body.branchRequisitionId
  );
  if (!branchReq) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Branch Requisition")
    );
  }

  if (
    branchReq.branchReqAckStatus === "ACK_PENDING" ||
    !["Approved", "Partially_Approved"].includes(branchReq.branchReqStatus)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition")
    );
  }

  body.branchReq = branchReq;

  for (const element of body.returnItems) {
    let totalReturnQty = 0;

    const brDetails = branchReq.branchRequisitionDetails.find(
      (d) => d.id === element.branchRequisitionDetailsId
    );

    if (!brDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch Requisition Details")
      );
    }

    if (brDetails.itemId !== element.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item")
      );
    }

    for (const item of element.itemBatch) {
      totalReturnQty += item.returnQty;

      const branchItem = await getBranchItemDetailsFromDb(
        item.branchItemDetailsId
      );

      if (!branchItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.isBatch && item.batchNo ? item.batchNo : "-"}`,
            "Branch Requisition"
          )
        );
      }

      if (
        branchItem.branchRequisitionDetailsId !==
        element.branchRequisitionDetailsId
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_FIELD", "Branch Requisition details")
        );
      }

      if (branchItem.itemId !== element.itemId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_FIELD", "Item")
        );
      }

      if (
        branchItem.acknowledgedQty - branchItem.returnedQty <
        item.returnQty
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.isBatch && item.batchNo ? item.batchNo : "-"}`,
            "Branch Requisition"
          )
        );
      }

      const stockQty = await getItemStockQtyByBatchWise({
        itemId: element.itemId,
        batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
        ccId: body.branchId,
        expiryDate:
          item.isExpiry && item.expiryDate ? new Date(item.expiryDate) : null,
        isFoc: item.isFoc,
      });

      if (!stockQty) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Item Stock for Batch no : ${
              item.isBatch && item.batchNo ? item.batchNo : "-"
            }`
          )
        );
      }

      if (stockQty < item.returnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Batch no : ${item.isBatch && item.batchNo ? item.batchNo : "-"}`
          )
        );
      }
    }

    ensureMatch(
      totalReturnQty,
      element.requestedReturnQty,
      "Returned Qty",
      "Requested Qty"
    );
  }

  logger.info(
    "exiting::validateBranchRequisitionReturnCommon::service::validation"
  );
};

export const createBranchRequisitionReturnServiceValidation = async (
  body: CreateBranchRequisitionReturnInput
) => {
  logger.info(
    "entering::createBranchRequisitionReturnServiceValidation::service::validation"
  );

  await validateBranchRequisitionReturnCommon(body);

  logger.info(
    "exiting::createBranchRequisitionReturnServiceValidation::service::validation"
  );
};

export const updateBranchRequisitionReturnServiceValidation = async (
  body: CreateBranchRequisitionReturnInput
) => {
  logger.info(
    "entering::updateBranchRequisitionReturnServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  if (body.id == null) {
    logger.error("missing branch requisition return id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Branch Requisition Return id")
    );
  }

  const currBRR = await validateIdBranchRequisitionReturn(body.id);
  body.branchReqReturn = currBRR;

  if (currBRR.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
    );
  }

  await validateBranchRequisitionReturnCommon(body);

  logger.info(
    "exiting::updateBranchRequisitionReturnServiceValidation::service::validation"
  );
};

export const rejectBranchRequisitionReturnServiceValidation = async (
  body: RejectBranchRequisitionReturnInput
) => {
  logger.info(
    "entering::rejectBranchRequisitionReturnServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const currBRR = await validateIdBranchRequisitionReturn(body.id);

  await validateIdBranch(body.branchId);

  if (currBRR.branchId !== body.branchId) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Location")
    );
  }

  if (currBRR.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
    );
  }

  logger.info(
    "exiting::rejectBranchRequisitionReturnServiceValidation::service::validation"
  );
};

export const approveBranchRequisitionReturnServiceValidation = async (
  body: ApproveBranchReqReturnInput
) => {
  logger.info(
    "entering::approveBranchRequisitionReturnServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const currBRR = await validateIdBranchRequisitionReturn(body.id);
  body.branchReqReturn = currBRR;

  await validateIdBranch(body.branchId);

  if (currBRR.branchId !== body.branchId) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Branch")
    );
  }

  const branchReq = await getBranchRequisitionBatchWiseFromDb(
    currBRR.branchRequisitionId
  );
  if (!branchReq) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Branch Requisition")
    );
  }

  if (
    branchReq.branchReqAckStatus === "ACK_PENDING" ||
    !["Approved", "Partially_Approved"].includes(branchReq.branchReqStatus)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition")
    );
  }

  body.branchReq = branchReq;

  if (currBRR.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
    );
  }

  for (const detail of body.returnItems) {
    const brrDetails = currBRR.branchRequisitionReturnDetails.find(
      (elem) => elem.id === detail.id
    );

    if (!brrDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch Requisition Return details")
      );
    }

    if (brrDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item")
      );
    }

    let totalReturnQty = 0;

    for (const item of detail.itemBatch) {
      totalReturnQty += item.returnQty;

      const branchReturnItem = brrDetails.branchReturnItemDetails.find(
        (det) => det.id === item.id
      );

      if (!branchReturnItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Branch Requisition Return batch details"
          )
        );
      }

      const branchItem = branchReq.branchItemDetails.find(
        (d) => d.id === branchReturnItem.branchItemDetailsId
      );

      if (!branchItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.batchNo ?? "-"}`,
            "Branch Requisition"
          )
        );
      }

      if (
        branchItem.acknowledgedQty - branchItem.returnedQty <
        item.returnQty
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.batchNo ?? "-"}`,
            "Branch Requisition"
          )
        );
      }

      const stockQty = await getItemStockQtyByBatchWise({
        itemId: detail.itemId,
        batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
        ccId: currBRR.branchId,
        expiryDate:
          item.isExpiry && item.expiryDate ? new Date(item.expiryDate) : null,
        isFoc: item.isFoc,
      });

      if (!stockQty) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Item Stock for Batch no : ${
              item.isBatch && item.batchNo ? item.batchNo : "-"
            }`
          )
        );
      }

      if (stockQty < item.returnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Batch no : ${item.isBatch && item.batchNo ? item.batchNo : "-"}`
          )
        );
      }
    }

    ensureMatch(
      totalReturnQty,
      detail.requestedReturnQty,
      "Returned Qty",
      "Requested Qty"
    );
  }

  logger.info(
    "exiting::approveBranchRequisitionReturnServiceValidation::service::validation"
  );
};

export const acknowledgeBranchRequisitionReturnServiceValidation = async (
  body: AcknowledgeBranchRequisitionReturn
) => {
  logger.info(
    "entering::acknowledgeBranchRequisitionReturnServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const currBRR = await validateIdBranchRequisitionReturn(body.id);
  body.branchReqReturn = currBRR;

  if (currBRR.ccId !== body.ccId) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Warehouse")
    );
  }

  await validateWarehouseId(body.ccId);

  if (
    currBRR.returnStatus !== "Approved" &&
    currBRR.returnStatus !== "Partially_Approved"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
    );
  }

  if (currBRR.ackStatus === "ACK_RECEIVED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_STATUS",
        "Branch Requisition Return Acknowledge"
      )
    );
  }

  let currTotalAckQty = 0;

  for (const detail of body.acknowledgeItems) {
    currTotalAckQty += detail.acknowledgedReturnQty;

    const brrDetails = currBRR.branchRequisitionReturnDetails.find(
      (elem) => elem.id === detail.id
    );

    if (!brrDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch Requisition Return details")
      );
    }

    if (brrDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item")
      );
    }

    let totalAckQty = 0;

    for (const item of detail.itemBatch) {
      const branchReturnItem = brrDetails.branchReturnItemDetails.find(
        (itemDet) => itemDet.id === item.id
      );

      if (!branchReturnItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Branch Requisition Return batch details"
          )
        );
      }

      const nextAcknowledgedQty =
        branchReturnItem.acknowledgedQty + item.acknowledgedQty;

      if (branchReturnItem.returnQty < nextAcknowledgedQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_FIELD",
            `Acknowledge quantity for Batch no : ${item.batchNo ?? "-"}`
          )
        );
      }

      item.isCompleted = branchReturnItem.returnQty === nextAcknowledgedQty;

      totalAckQty += item.acknowledgedQty;
    }

    ensureMatch(
      totalAckQty,
      detail.acknowledgedReturnQty,
      "Total Acknowledge Quantity",
      "Acknowledged Return Quantity"
    );
  }

  const totalAckQtyTill = currBRR.branchRequisitionReturnDetails.reduce(
    (acc, details) => acc + details.acknowledgedReturnQty,
    0
  );

  const totalReturnQty = currBRR.branchRequisitionReturnDetails.reduce(
    (acc, details) => acc + details.requestedReturnQty,
    0
  );

  if (totalReturnQty < totalAckQtyTill + currTotalAckQty) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "Item Total quantity")
    );
  }

  if (totalReturnQty === totalAckQtyTill + currTotalAckQty) {
    body.ackStatus = "ACK_RECEIVED";
  } else {
    body.ackStatus = "ACK_PARTIALLY_RECEIVED";
  }

  logger.info(
    "exiting::acknowledgeBranchRequisitionReturnServiceValidation::service::validation"
  );
};

export const deleteBranchRequisitionReturnServiceValidation = async (
  id: number
) => {
  logger.info(
    "entering::deleteBranchRequisitionReturnServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const brr = await validateIdBranchRequisitionReturn(id);

  if (brr.returnStatus !== STORE_REQ_STATUS.Pending) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch Requisition Return")
    );
  }

  logger.info(
    "exiting::deleteBranchRequisitionReturnServiceValidation::service::validation"
  );
};
