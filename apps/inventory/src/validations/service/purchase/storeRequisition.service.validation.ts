import { coreRequests } from "@/client/core/request";
import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository";
import {
  getRequisitionItemDetailsFromDb,
  validateStoreRequisitionByIdFromDb,
} from "@/repository/purchase/storeRequisition.repository";
import { getStockById } from "@/repository/stock/stock.repository";
import {
  AcknowledgeRequisition,
  ApproveStoreReqInput,
  CreateStoreRequisitionInput,
  RejectStoreRequisitionInput,
  StoreRequisitionDetailInput,
} from "@/types/purchase/storeRequisition";
import ErrorHandler from "@/utils/errorHandler.utils";
import { validateBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";
import { STORE_REQ_STATUS } from "@prisma/client";
import dayjs from "dayjs";

export const validateIdStoreRequisition = async (id: number) => {
  logger.info("entering::validateIdStoreRequisition service::validation");
  validIdCheck(id);
  const storeReq = await validateStoreRequisitionByIdFromDb(id);
  if (!storeReq) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store Requisition"));
  }
  logger.info("exiting::validateIdStoreRequisition::service::validation");

  return storeReq;
};

export const validateStoreRequisitionCommon = async (body: CreateStoreRequisitionInput): Promise<void> => {
  logger.info("entering::validateStoreRequisitionCommon::service::validation");

  await validateBranchOrWarehouse(body.ccId);

  if (body.storeReqStatus && body.storeReqStatus !== "Pending" && body.storeReqStatus !== "Draft") {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "Store requisition"));
  }

  const userId = coreRequests.getEmployeeCache(body.requisitionFrom);
  if (!userId) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Employee"));
  }

  const itemIds: number[] = body.storeRequisitionDetails.map((d: StoreRequisitionDetailInput) => d.itemId);

  const items = await getCountItemsFromDb(itemIds);

  if (items.length !== itemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  // const mappedIds = await getMappedItemIdsForBranch(body.ccId, itemIds);
  // const unmappedIds = [...new Set(itemIds)].filter((id) => !mappedIds.some((item) => item.itemId === id));
  // if (unmappedIds.length) {
  //   const names = unmappedIds.map((id) => items.find((x) => x.id === id)?.item ?? `ID:${id}`).join(", ");
  //   throw new ErrorHandler(404, `Item Branch Map not found for: ${names}`);
  // }
};

export const createStoreRequisitionServiceValidation = async (body: CreateStoreRequisitionInput) => {
  logger.info("entering::createStoreRequisitionServiceValidation::service::validation");

  await validateStoreRequisitionCommon(body);

  logger.info("exiting::createStoreRequisitionServiceValidation::service::validation");
};

export const updateStoreRequisitionServiceValidation = async (body: CreateStoreRequisitionInput) => {
  logger.info("entering::updateStoreRequisitionServiceValidation::service::validation");

  if (body.id == null) {
    logger.error("missing storeRequisition id in update request");
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store Requisition id"));
  }
  logger.info(`validating existence of storeRequisition id=${body.id}`);
  const currReq = await validateIdStoreRequisition(body.id);
  body.storeReq = currReq;

  if (currReq.storeReqStatus === "Approved" || currReq.storeReqStatus === "Partially_Approved") {
    throw new ErrorHandler(404, generateErrorMessage("INVALID_STATUS", "Store requisition"));
  }

  const updatedIds: number[] = body.storeRequisitionDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in stock transfer details
  const existingIds = currReq.storeRequisitionDetails.map((item) => item.id);
  // check if any item is not in stock transfer details
  const notInRequisitionDetails = updatedIds.filter((id) => !existingIds.includes(id));
  if (notInRequisitionDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", `Id ${notInRequisitionDetails.join(", ")} of Stock Transfer Details`)
    );
  }

  await validateStoreRequisitionCommon(body);

  logger.info("exiting::updateStoreRequisitionServiceValidation::service::validation");
};

export const rejectStoreRequisitionServiceValidation = async (body: RejectStoreRequisitionInput) => {
  logger.info("entering::rejectStoreRequisitionServiceValidation::service::validation");

  const currStoreReq = await validateIdStoreRequisition(body.id);
  await validateBranchOrWarehouse(body.ccId);

  if (currStoreReq.ccId !== body.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL", "Correct Location"));
  }
  if (currStoreReq.storeReqStatus !== "Pending" && currStoreReq.storeReqStatus !== "Draft") {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "Store requisition"));
  }
  logger.info("exiting::rejectStoreRequisitionServiceValidation::service::validation");
};

export const approveStoreRequisitionServiceValidation = async (body: ApproveStoreReqInput) => {
  logger.info("entering::approveStoreRequisitionServiceValidation::service::validation");

  const currStoreReq = await validateIdStoreRequisition(body.storeReqId);
  body.storeReq = currStoreReq;
  await validateBranchOrWarehouse(body.ccId);

  if (currStoreReq.ccId !== body.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL", "Current Location"));
  }

  if (currStoreReq.storeReqStatus !== "Pending" && currStoreReq.storeReqStatus !== "Partially_Approved") {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "Store requisition"));
  }

  if (currStoreReq.srNumber !== body.storeReqNo) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", "Store requisition number"));
  }
  let totalAssignQty = 0;

  for (const detail of body.assignItems) {
    const srDetails = currStoreReq.storeRequisitionDetails.find((elem) => elem.id === detail.storeRequisitionDetailsId);

    if (!srDetails) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", `Store requisition details.`));
    }
    totalAssignQty += detail.assignedQty;

    if (srDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", "Item"));
    }

    const assignQty = body.assignItems.reduce((acc, item) => {
      if (item.storeRequisitionDetailsId === detail.storeRequisitionDetailsId) {
        return (acc += item.assignedQty);
      } else return acc;
    }, 0);

    if (srDetails.reqQuantity < assignQty) {
      throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", `Assign Quantity for `));
    }

    const stock = await getStockById(detail.itemStockId);
    if (!stock) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", `Item Stock`));
    }

    if (
      stock.batchNo !== detail.batchNo ||
      dayjs(stock.expiryDate).format("YYYY-MM-DD") !== dayjs(detail.expiryDate).format("YYYY-MM-DD")
    ) {
      throw new ErrorHandler(400, generateErrorMessage("INVALID_VALUE", `Item for Batch no : ${detail.batchNo}`));
    }

    if (stock.quantity < detail.assignedQty) {
      throw new ErrorHandler(400, generateErrorMessage("INSUFFICIENT_STOCK", `Batch no : ${detail.batchNo}`));
    }
  }

  const totalReqQty = currStoreReq.storeRequisitionDetails.reduce((acc, details) => (acc += details.reqQuantity), 0);

  const alreadyAssignedQty = currStoreReq.storeRequisitionDetails.reduce(
    (acc, details) => (acc += details.assignedQuantity),
    0
  );
  const alreadyAckQty = currStoreReq.storeRequisitionDetails.reduce(
    (acc, details) => (acc += details.acknowledgedQuantity),
    0
  );

  if (totalAssignQty + alreadyAssignedQty > totalReqQty) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_VALUE", `Item Total quantity`));
  } else if (totalAssignQty + alreadyAssignedQty < totalReqQty) {
    body.storeReqStatus = "Partially_Approved";
  } else {
    body.storeReqStatus = "Approved";
  }

  if (currStoreReq.storeReqAckStatus === "ACK_RECEIVED" && totalAssignQty + alreadyAssignedQty > alreadyAckQty) {
    body.storeReqAckStatus = "ACK_PARTIALLY_RECEIVED";
  }
  logger.info("exiting::approveStoreRequisitionServiceValidation::service::validation");
};

export const acknowledgeStoreRequisitionServiceValidation = async (body: AcknowledgeRequisition) => {
  logger.info("entering::acknowledgeStoreRequisitionServiceValidation::service::validation");

  const currStoreReq = await validateIdStoreRequisition(body.storeReqId);
  body.storeReq = currStoreReq;

  if (currStoreReq.requisitionFrom !== body.requisitionFrom) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL", "Current Location"));
  }

  if (currStoreReq.storeReqStatus !== "Approved" && currStoreReq.storeReqStatus !== "Partially_Approved") {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "store req status"));
  }

  if (currStoreReq.storeReqAckStatus === "ACK_RECEIVED") {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "store req acknowledge status"));
  }

  await validateBranchOrWarehouse(body.ccId);

  if (currStoreReq.srNumber !== body.storeReqNo) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", "Store requisition number"));
  }
  let currTotalAckQty = 0;

  for (const detail of body.acknowledgeItems) {
    currTotalAckQty += detail.totalAcknowledgeQty;
    const srDetails = currStoreReq.storeRequisitionDetails.find((elem) => elem.id === detail.storeRequisitionDetailsId);

    if (!srDetails) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", `Store requisition details.`));
    }

    if (srDetails.itemId !== detail.itemId) {
      throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", "Item"));
    }

    let totalAckQty = 0;

    for (const item of detail.itemBatch) {
      const requisitionItem = await getRequisitionItemDetailsFromDb(item.requisitionItemId);

      if (!requisitionItem) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", `Store requisition details.`));
      }

      if (requisitionItem.assignedQty < requisitionItem.acknowledgedQty + item.acknowledgeQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_FIELD", `Acknowledge quantity for Batch no : ${item.batchNo}`)
        );
      } else if (requisitionItem.assignedQty > requisitionItem.acknowledgedQty + item.acknowledgeQty) {
        // TODO : Send email to warehouse
        item.isCompleted = false;
      } else {
        item.isCompleted = true;
      }

      totalAckQty += item.acknowledgeQty;
    }

    if (detail.totalAcknowledgeQty !== totalAckQty) {
      throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", `Total acknowledge quantity`));
    }
  }

  const totalReqQty = currStoreReq.storeRequisitionDetails.reduce((acc, details) => (acc += details.reqQuantity), 0);

  const totalAckQtyTill = currStoreReq.storeRequisitionDetails.reduce(
    (acc, details) => (acc += details.acknowledgedQuantity),
    0
  );

  const totalAssignQty = currStoreReq.storeRequisitionDetails.reduce(
    (acc, details) => (acc += details.assignedQuantity),
    0
  );

  if (totalReqQty < totalAckQtyTill + currTotalAckQty) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", `Item Total quantity`));
  } else if (totalAssignQty === totalAckQtyTill + currTotalAckQty) {
    body.storeReqAckStatus = "ACK_RECEIVED";
  } else {
    body.storeReqAckStatus = "ACK_PARTIALLY_RECEIVED";
  }

  logger.info("exiting::acknowledgeStoreRequisitionServiceValidation::service::validation");
};

export const deleteStoreRequisitionServiceValidation = async (id: number) => {
  logger.info("entering::createStoreRequisitionServiceValidation::service::validation");

  const srn = await validateIdStoreRequisition(id);
  if (srn.storeReqStatus !== STORE_REQ_STATUS.Draft && srn.storeReqStatus !== STORE_REQ_STATUS.Pending) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "Store requisition"));
  }
  logger.info("exiting::createStoreRequisitionServiceValidation::service::validation");
};
