import { getCountItemsFromDb } from "@/repository/item/item.repository.js";
import { getMappedItemIdsForBranch } from "@/repository/item/itemBranchMap.repository.js";
import {
  getPendingSRRFromSRId,
  getStoreRequisitionReturnByIdFromDb,
} from "@/repository/purchase/requisitionReturn.repository.js";
import {
  valStoreRequisitionBatchWiseFromDb,
  valStoreRequisitionFromDb,
} from "@/repository/purchase/storeRequisition.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  RejectStoreRequisitionReturnInput,
} from "@/types/purchase/requisitionReturn.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { STORE_REQ_STATUS } from "@repo/db/generated/prisma/enums.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateIdEmployee } from "../staff/employee.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";

export const validateIdStoreRequisitionReturn = async (id: number) => {
  logger.info("entering::validateIdStoreRequisitionReturn service::validation");
  validIdCheck(id);
  const storeReqReturn = await getStoreRequisitionReturnByIdFromDb(id);
  if (!storeReqReturn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition return"),
    );
  }
  logger.info("exiting::validateIdStoreRequisition::service::validation");

  return storeReqReturn;
};

export const validateStoreRequisitionCommon = async (
  body: CreateStoreRequisitionReturnInput,
): Promise<void> => {
  logger.info("entering::validateStoreRequisitionCommon::service::validation");

  await validateIdEmployee(body.requisitionFrom);
  await validateIdBranch(body.ccId);

  const pendingSRR = await getPendingSRRFromSRId(body.storeRequisitionId);
  if (pendingSRR.length > 0) {
    if (!body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Store requisition return"),
      );
    } else {
      const isAnyPendingReturn = pendingSRR.filter((srr) => srr.id !== body.id);
      if (isAnyPendingReturn.length > 0) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Store requisition return"),
        );
      }
    }
  }

  if (
    body.returnStatus &&
    body.returnStatus !== "Pending" &&
    body.returnStatus !== "Draft"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store requisition return"),
    );
  }

  let itemIds: number[] = body.returnItems.map((d) => d.itemId);
  itemIds = Array.from(new Set(itemIds));

  const items = await getCountItemsFromDb(itemIds);

  if (items.length !== itemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  const mappedIds = await getMappedItemIdsForBranch(body.ccId, itemIds);
  const unmappedIds = [...new Set(itemIds)].filter(
    (id) => !mappedIds.some((item) => item.itemId === id),
  );
  if (unmappedIds.length) {
    const names = unmappedIds
      .map((id) => items.find((x) => x.id === id)?.medicineName ?? `ID:${id}`)
      .join(", ");
    throw new ErrorHandler(404, `Item Branch Map not found for: ${names}`);
  }

  const storeReq = await valStoreRequisitionFromDb(body.storeRequisitionId);
  if (!storeReq) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition"),
    );
  }

  if (
    storeReq.storeReqAckStatus === "ACK_PENDING" ||
    !["Approved", "Partially_Approved"].includes(storeReq.storeReqStatus)
  )
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition"),
    );

  body.storeReq = storeReq;

  for (const element of body.returnItems) {
    let totalIndQty = 0;
    const storeReqDet = storeReq.storeRequisitionDetails.find(
      (d) => d.id === element.storeRequisitionDetailsId,
    );
    if (!storeReqDet) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition details"),
      );
    }
    for (const item of element.itemBatch) {
      totalIndQty += item.returnQty;
      const storeReqItem = storeReq.requisitionItemDetails.find(
        (d) => d.id === item.requisitionItemDetailsId,
      );
      if (!storeReqItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
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
            "NOT_FOUND",
            `Item Stock for Batch no : ${item.batchNo}`,
          ),
        );
      }

      const stockQty = await getItemStockQtyByBatchWise(
        element.itemId,
        {
          branchId: body.ccId,
        },
        item.batchNo,
        item.expiryDate ? new Date(item.expiryDate) : undefined,
        item.isFoc,
      );
      if (!stockQty) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Item Stock for Batch no : ${item.batchNo}`,
          ),
        );
      }

      if (stockQty < item.returnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Batch no : ${item.batchNo}`,
          ),
        );
      }
    }

    if (totalIndQty !== element.requestedReturnQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "MISMATCH",
          `Requested Qty: ${element.requestedReturnQty}`,
          `Returned Qty: ${totalIndQty}`,
        ),
      );
    }
  }
};

export const createStoreRequisitionReturnServiceValidation = async (
  body: CreateStoreRequisitionReturnInput,
) => {
  logger.info(
    "entering::createStoreRequisitionServiceValidation::service::validation",
  );

  await validateStoreRequisitionCommon(body);

  logger.info(
    "exiting::createStoreRequisitionServiceValidation::service::validation",
  );
};

export const updateStoreRequisitionReturnServiceValidation = async (
  body: CreateStoreRequisitionReturnInput,
) => {
  logger.info(
    "entering::updateStoreRequisitionServiceValidation::service::validation",
  );

  if (body.id == null) {
    logger.error("missing store Requisition return id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Store Requisition id"),
    );
  }
  logger.info(`validating existence of store Requisition return id=${body.id}`);
  const currReqReturn = await validateIdStoreRequisitionReturn(body.id);
  body.storeReqReturn = currReqReturn;

  if (
    currReqReturn.returnStatus !== "Pending" &&
    currReqReturn.returnStatus !== "Draft"
  ) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("INVALID_STATUS", "Store requisition return"),
    );
  }

  await validateStoreRequisitionCommon(body);

  logger.info(
    "exiting::updateStoreRequisitionServiceValidation::service::validation",
  );
};

export const rejectStoreRequisitionReturnServiceValidation = async (
  body: RejectStoreRequisitionReturnInput,
) => {
  logger.info(
    "entering::rejectStoreRequisitionReturnServiceValidation::service::validation",
  );

  const currStoreReq = await validateIdStoreRequisitionReturn(body.id);
  await validateIdBranch(body.ccId);

  if (currStoreReq.branchId !== body.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }
  if (
    currStoreReq.returnStatus !== "Pending" &&
    currStoreReq.returnStatus !== "Draft"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store requisition return"),
    );
  }
  logger.info(
    "exiting::rejectStoreRequisitionServiceValidation::service::validation",
  );
};

export const approveStoreRequisitionReturnServiceValidation = async (
  body: ApproveStoreReqReturnInput,
) => {
  logger.info(
    "entering::approveStoreRequisitionServiceValidation::service::validation",
  );

  const currStoreReqRet = await validateIdStoreRequisitionReturn(body.id);
  body.storeReqReturn = currStoreReqRet;
  await validateIdBranch(body.ccId);

  const storeReq = await valStoreRequisitionBatchWiseFromDb(
    currStoreReqRet.storeRequisitionId,
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
  )
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store Requisition"),
    );

  body.storeReq = storeReq;

  if (currStoreReqRet.branchId !== body.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (
    currStoreReqRet.returnStatus !== "Pending" &&
    currStoreReqRet.returnStatus !== "Draft"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store requisition"),
    );
  }

  for (const detail of body.returnItems) {
    const srrDetails = currStoreReqRet.storeRequisitionReturnDetails.find(
      (elem) => elem.id === detail.id,
    );
    let totalIndQty = 0;
    if (!srrDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Store requisition return details.`),
      );
    }

    if (srrDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item"),
      );
    }

    for (const item of detail.itemBatch) {
      totalIndQty += item.returnQty;
      const requisitionItem = srrDetails.requisitionReturnItemDetails.find(
        (det) => item.id === det.id,
      );
      const storeReqItem = storeReq.requisitionItemDetails.find(
        (d) => d.id === requisitionItem?.requisitionItemDetailsId,
      );

      if (!requisitionItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Store requisition return details.`,
          ),
        );
      }
      if (!storeReqItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
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
            "NOT_FOUND",
            `Item Stock for Batch no : ${item.batchNo}`,
          ),
        );
      }

      const stockQty = await getItemStockQtyByBatchWise(
        detail.itemId,
        {
          branchId: body.ccId,
        },
        item.batchNo,
        item.expiryDate ? new Date(item.expiryDate) : undefined,
        item.isFoc,
      );
      if (!stockQty) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Item Stock for Batch no : ${item.batchNo}`,
          ),
        );
      }

      if (stockQty < item.returnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Item Stock for Batch no : ${item.batchNo}`,
          ),
        );
      }
    }

    if (totalIndQty !== detail.requestedReturnQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "MISMATCH",
          `Requested Qty: ${detail.requestedReturnQty}`,
          `Returned Qty: ${totalIndQty}`,
        ),
      );
    }
  }

  logger.info(
    "exiting::approveStoreRequisitionServiceValidation::service::validation",
  );
};

export const acknowledgeStoreRequisitionReturnServiceValidation = async (
  body: AcknowledgeRequisitionReturn,
) => {
  logger.info(
    "entering::acknowledgeStoreRequisitionServiceValidation::service::validation",
  );

  const currSRR = await validateIdStoreRequisitionReturn(body.id);
  body.storeReqReturn = currSRR;

  if (currSRR.warehouseId !== body.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (
    currSRR.returnStatus !== "Approved" &&
    currSRR.returnStatus !== "Partially_Approved"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "store req status"),
    );
  }

  if (currSRR.ackStatus === "ACK_RECEIVED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "store req acknowledge status"),
    );
  }

  await validateWarehouseId(body.ccId);

  let currTotalAckQty = 0;

  for (const detail of body.acknowledgeItems) {
    currTotalAckQty += detail.acknowledgedQuantity;
    const srDetails = currSRR.storeRequisitionReturnDetails.find(
      (elem) => elem.id === detail.id,
    );

    if (!srDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Store requisition return details.`),
      );
    }

    if (srDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Item"),
      );
    }

    let totalAckQty = 0;

    for (const item of detail.itemBatch) {
      const requisitionItem = srDetails.requisitionReturnItemDetails.find(
        (itemDet) => itemDet.id === item.id,
      );

      if (!requisitionItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Store requisition return details.`,
          ),
        );
      }

      if (
        requisitionItem.returnQty <
        requisitionItem.acknowledgedQty + item.acknowledgeQty
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_FIELD",
            `Acknowledge quantity for Batch no : ${item.batchNo}`,
          ),
        );
      } else if (
        requisitionItem.returnQty >
        requisitionItem.acknowledgedQty + item.acknowledgeQty
      ) {
        // TODO : Send email to warehouse
        item.isCompleted = false;
      } else {
        item.isCompleted = true;
      }

      totalAckQty += item.acknowledgeQty;
    }

    if (detail.acknowledgedQuantity !== totalAckQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", `Total acknowledge quantity`),
      );
    }
  }

  const totalAckQtyTill = currSRR.storeRequisitionReturnDetails.reduce(
    (acc, details) => (acc += details.acknowledgedReturnQty),
    0,
  );

  const totalAssignQty = currSRR.storeRequisitionReturnDetails.reduce(
    (acc, details) => (acc += details.requestedReturnQty),
    0,
  );

  if (totalAssignQty < totalAckQtyTill + currTotalAckQty) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", `Item Total quantity`),
    );
  } else if (totalAssignQty === totalAckQtyTill + currTotalAckQty) {
    body.storeReqAckStatus = "ACK_RECEIVED";
  } else {
    body.storeReqAckStatus = "ACK_PARTIALLY_RECEIVED";
  }

  logger.info(
    "exiting::acknowledgeStoreRequisitionServiceValidation::service::validation",
  );
};

export const deleteStoreRequisitionReturnServiceValidation = async (
  id: number,
) => {
  logger.info(
    "entering::createStoreRequisitionReturnServiceValidation::service::validation",
  );

  const srn = await validateIdStoreRequisitionReturn(id);
  if (
    srn.returnStatus !== STORE_REQ_STATUS.Draft &&
    srn.returnStatus !== STORE_REQ_STATUS.Pending
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Store requisition return"),
    );
  }
  logger.info(
    "exiting::createStoreRequisitionReturnServiceValidation::service::validation",
  );
};
