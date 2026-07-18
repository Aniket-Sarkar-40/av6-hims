import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import {
  getStoreRequisitionBatchWiseFromDb,
  valStoreRequisitionFromDb,
} from "@/repository/purchase/storeRequisition.repository.js";
import {
  getPendingSRRFromSRId,
  getStoreRequisitionReturnByIdFromDb,
} from "@/repository/purchase/storeRequisitionReturn.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  RejectStoreRequisitionReturnInput,
} from "@/types/purchase/storeRequisitionReturn.js";
import { validateIdBranch } from "@/validations/service/master/branch.service.validation.js";
import { validateIdItemMaster } from "@/validations/service/master/itemMaster.service.validation.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { STORE_REQ_STATUS } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  ensureMatch,
  generateErrorMessage,
} from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdStoreRequisitionReturn = async (id: number) => {
  logger.info(
    "entering::validateIdStoreRequisitionReturn::service::validation",
  );

  validIdCheck(id);

  const storeReqReturn = await getStoreRequisitionReturnByIdFromDb(id);

  if (!storeReqReturn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition Return"),
    );
  }

  logger.info("exiting::validateIdStoreRequisitionReturn::service::validation");
  return storeReqReturn;
};

export const validateStoreRequisitionReturnCommon = async (
  body: CreateStoreRequisitionReturnInput,
): Promise<void> => {
  logger.info(
    "entering::validateStoreRequisitionReturnCommon::service::validation",
  );

  const user = await employeeService.getEmployeeByIdFrmCacheOrDb(
    body.requisitionFrom,
  );
  if (!user) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Employee"));
  }

  await validateIdBranch(body.ccId);

  const pendingSRR = await getPendingSRRFromSRId(body.storeRequisitionId);
  if (pendingSRR.length > 0) {
    if (!body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
      );
    }
    const isAnyPendingReturn = pendingSRR.some((srr) => srr.id !== body.id);
    if (isAnyPendingReturn) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
      );
    }
  }

  if (body.returnStatus && body.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
    );
  }

  const itemIds = Array.from(new Set(body.returnItems.map((d) => d.itemId)));
  const items = await getCountItemsFromDb(itemIds);
  if (items.length !== itemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  const storeReq = await valStoreRequisitionFromDb(body.storeRequisitionId);
  if (!storeReq) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition"),
    );
  }

  if (storeReq.requisitionFrom !== body.requisitionFrom) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Login Role"),
    );
  }

  if (
    storeReq.storeReqAckStatus === "ACK_PENDING" ||
    !["Approved", "Partially_Approved"].includes(storeReq.storeReqStatus)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition"),
    );
  }

  body.storeReq = storeReq;

  for (const element of body.returnItems) {
    let totalReturnQty = 0;

    const storeReqDet = storeReq.storeRequisitionDetails.find(
      (d) => d.id === element.storeRequisitionDetailsId,
    );

    if (!storeReqDet) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition details"),
      );
    }

    if (storeReqDet.itemId !== element.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item"),
      );
    }

    if (element.itemId) {
      const itemData = items.find((item) => item.id === element.itemId);
      if (itemData) {
        if (!itemData.isUserReturnable) {
          throw new ErrorHandler(
            400,
            `Item: ${itemData.item} is set as non-returnable for user`,
          );
        }
      }
    }

    for (const item of element.itemBatch) {
      totalReturnQty += item.returnQty;

      const storeReqItem = storeReq.requisitionInvItemDetails.find(
        (d) => d.id === item.requisitionItemDetailsId,
      );

      if (!storeReqItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.batchNo}`,
            "Store Requisition",
          ),
        );
      }

      if (
        storeReqItem.storeRequisitionDetailsId !==
        element.storeRequisitionDetailsId
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_FIELD", "Store Requisition details"),
        );
      }

      if (storeReqItem.itemId !== element.itemId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_FIELD", "Item"),
        );
      }

      if (
        storeReqItem.acknowledgedQty - storeReqItem.returnedQty <
        item.returnQty
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.batchNo}`,
            "Store Requisition",
          ),
        );
      }

      const stockQty = await getItemStockQtyByBatchWise({
        itemId: element.itemId,
        batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
        userId: body.requisitionFrom,
        expiryDate:
          item.isExpiry && item.expiryDate
            ? new Date(item.expiryDate)
            : undefined,
        isFoc: item.isFoc,
      });

      if (!stockQty) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Item Stock for Batch no : ${
              item.isBatch && item.batchNo ? item.batchNo : "-"
            }`,
          ),
        );
      }

      if (stockQty < item.returnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Batch no : ${item.isBatch && item.batchNo ? item.batchNo : "-"}`,
          ),
        );
      }
    }

    ensureMatch(
      totalReturnQty,
      element.requestedReturnQty,
      "Returned Qty",
      "Requested Qty",
    );
  }

  logger.info(
    "exiting::validateStoreRequisitionReturnCommon::service::validation",
  );
};

export const createStoreRequisitionReturnServiceValidation = async (
  body: CreateStoreRequisitionReturnInput,
) => {
  logger.info(
    "entering::createStoreRequisitionReturnServiceValidation::service::validation",
  );

  await validateStoreRequisitionReturnCommon(body);

  logger.info(
    "exiting::createStoreRequisitionReturnServiceValidation::service::validation",
  );
};

export const updateStoreRequisitionReturnServiceValidation = async (
  body: CreateStoreRequisitionReturnInput,
) => {
  logger.info(
    "entering::updateStoreRequisitionReturnServiceValidation::service::validation",
  );

  if (body.id == null) {
    logger.error("missing store requisition return id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition Return id"),
    );
  }

  const currReqReturn = await validateIdStoreRequisitionReturn(body.id);
  body.storeReqReturn = currReqReturn;

  if (currReqReturn.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
    );
  }

  if (currReqReturn.ccId !== body.ccId) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Location"),
    );
  }

  if (currReqReturn.requisitionFrom !== body.requisitionFrom) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Location"),
    );
  }

  await validateStoreRequisitionReturnCommon(body);

  logger.info(
    "exiting::updateStoreRequisitionReturnServiceValidation::service::validation",
  );
};

export const rejectStoreRequisitionReturnServiceValidation = async (
  body: RejectStoreRequisitionReturnInput,
) => {
  logger.info(
    "entering::rejectStoreRequisitionReturnServiceValidation::service::validation",
  );

  const currStoreReqReturn = await validateIdStoreRequisitionReturn(body.id);

  await validateIdBranch(body.ccId);

  if (currStoreReqReturn.ccId !== body.ccId) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Location"),
    );
  }

  if (currStoreReqReturn.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
    );
  }

  logger.info(
    "exiting::rejectStoreRequisitionReturnServiceValidation::service::validation",
  );
};

export const approveStoreRequisitionReturnServiceValidation = async (
  body: ApproveStoreReqReturnInput,
) => {
  logger.info(
    "entering::approveStoreRequisitionReturnServiceValidation::service::validation",
  );

  const currStoreReqReturn = await validateIdStoreRequisitionReturn(body.id);
  body.storeReqReturn = currStoreReqReturn;

  await validateIdBranch(body.ccId);

  if (currStoreReqReturn.ccId !== body.ccId) {
    throw new ErrorHandler(
      403,
      generateErrorMessage("ACCESS_FAIL", "Correct Location"),
    );
  }

  const storeReq = await getStoreRequisitionBatchWiseFromDb(
    currStoreReqReturn.storeRequisitionId,
  );
  if (!storeReq) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition"),
    );
  }

  if (
    storeReq.storeReqAckStatus === "ACK_PENDING" ||
    !["Approved", "Partially_Approved"].includes(storeReq.storeReqStatus)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition"),
    );
  }

  body.storeReq = storeReq;

  if (currStoreReqReturn.returnStatus !== "Pending") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
    );
  }

  for (const detail of body.returnItems) {
    const srrDetails = currStoreReqReturn.storeRequisitionReturnDetails.find(
      (elem) => elem.id === detail.id,
    );

    if (!srrDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition Return details"),
      );
    }

    if (srrDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item"),
      );
    }

    let totalReturnQty = 0;

    for (const item of detail.itemBatch) {
      totalReturnQty += item.returnQty;

      const requisitionReturnItem =
        srrDetails.requisitionReturnItemDetails.find(
          (det) => det.id === item.id,
        );

      if (!requisitionReturnItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Store Requisition Return batch details",
          ),
        );
      }

      const storeReqItem = storeReq.requisitionInvItemDetails.find(
        (d) => d.id === requisitionReturnItem.requisitionItemDetailsId,
      );

      if (!storeReqItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.batchNo}`,
            "Store Requisition",
          ),
        );
      }

      if (
        storeReqItem.acknowledgedQty - storeReqItem.returnedQty <
        item.returnQty
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_RETURN",
            `Batch: ${item.batchNo}`,
            "Store Requisition",
          ),
        );
      }

      const stockQty = await getItemStockQtyByBatchWise({
        itemId: detail.itemId,
        batchNo: item.isBatch && item.batchNo ? item.batchNo : null,
        userId: currStoreReqReturn.requisitionFrom,
        expiryDate:
          item.isExpiry && item.expiryDate
            ? new Date(item.expiryDate)
            : undefined,
        isFoc: item.isFoc,
      });

      if (!stockQty) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Item Stock for Batch no : ${
              item.isBatch && item.batchNo ? item.batchNo : "-"
            }`,
          ),
        );
      }

      if (stockQty < item.returnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Batch no : ${item.isBatch && item.batchNo ? item.batchNo : "-"}`,
          ),
        );
      }
    }

    ensureMatch(
      totalReturnQty,
      detail.requestedReturnQty,
      "Returned Qty",
      "Requested Qty",
    );
  }

  logger.info(
    "exiting::approveStoreRequisitionReturnServiceValidation::service::validation",
  );
};

export const acknowledgeStoreRequisitionReturnServiceValidation = async (
  body: AcknowledgeRequisitionReturn,
) => {
  logger.info(
    "entering::acknowledgeStoreRequisitionReturnServiceValidation::service::validation",
  );

  const currSRR = await validateIdStoreRequisitionReturn(body.id);
  body.storeReqReturn = currSRR;

  await validateIdBranch(body.ccId);

  if (
    currSRR.returnStatus !== "Approved" &&
    currSRR.returnStatus !== "Partially_Approved"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
    );
  }

  if (currSRR.ackStatus === "ACK_RECEIVED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_STATUS",
        "Store Requisition Return Acknowledge",
      ),
    );
  }

  let currTotalAckQty = 0;

  for (const detail of body.acknowledgeItems) {
    currTotalAckQty += detail.acknowledgedReturnQty;

    const srrDetails = currSRR.storeRequisitionReturnDetails.find(
      (elem) => elem.id === detail.id,
    );

    if (!srrDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition Return details"),
      );
    }

    if (srrDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item"),
      );
    }

    let totalAckQty = 0;

    for (const item of detail.itemBatch) {
      const requisitionReturnItem =
        srrDetails.requisitionReturnItemDetails.find(
          (itemDet) => itemDet.id === item.id,
        );

      if (!requisitionReturnItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            "Store Requisition Return batch details",
          ),
        );
      }

      const nextAcknowledgedQty =
        requisitionReturnItem.acknowledgedQty + item.acknowledgedQty;

      if (requisitionReturnItem.returnQty < nextAcknowledgedQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_FIELD",
            `Acknowledge quantity for Batch no : ${item.batchNo}`,
          ),
        );
      }

      item.isCompleted =
        requisitionReturnItem.returnQty === nextAcknowledgedQty;

      totalAckQty += item.acknowledgedQty;
    }

    ensureMatch(
      totalAckQty,
      detail.acknowledgedReturnQty,
      "Total Acknowledge Quantity",
      "Acknowledged Return Quantity",
    );
  }

  const totalAckQtyTill = currSRR.storeRequisitionReturnDetails.reduce(
    (acc, details) => acc + details.acknowledgedReturnQty,
    0,
  );

  const totalReturnQty = currSRR.storeRequisitionReturnDetails.reduce(
    (acc, details) => acc + details.requestedReturnQty,
    0,
  );

  if (totalReturnQty < totalAckQtyTill + currTotalAckQty) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "Item Total quantity"),
    );
  }

  if (totalReturnQty === totalAckQtyTill + currTotalAckQty) {
    body.ackStatus = "ACK_RECEIVED";
  } else {
    body.ackStatus = "ACK_PARTIALLY_RECEIVED";
  }

  logger.info(
    "exiting::acknowledgeStoreRequisitionReturnServiceValidation::service::validation",
  );
};

export const deleteStoreRequisitionReturnServiceValidation = async (
  id: number,
) => {
  logger.info(
    "entering::deleteStoreRequisitionReturnServiceValidation::service::validation",
  );

  const srr = await validateIdStoreRequisitionReturn(id);

  if (srr.returnStatus !== STORE_REQ_STATUS.Pending) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition Return"),
    );
  }

  logger.info(
    "exiting::deleteStoreRequisitionReturnServiceValidation::service::validation",
  );
};
