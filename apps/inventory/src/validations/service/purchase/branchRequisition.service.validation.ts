import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import {
  getBranchItemDetailsFromDb,
  validateBranchRequisitionByIdFromDb,
} from "@/repository/purchase/branchRequisition.repository.js";
import { getStockById } from "@/repository/stock/stock.repository.js";
import { settingsService } from "@/services/master/settings.service.js";
import {
  AcknowledgeBranchRequisition,
  ApproveBranchReqInput,
  BranchRequisitionDetailInput,
  CreateBranchRequisitionInput,
  RejectBranchRequisitionInput,
} from "@/types/purchase/branchRequisition.js";
import { validateBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { validateIdBranch } from "@/validations/service/master/branch.service.validation.js";
import { validateWarehouseId } from "@/validations/service/master/warehouse.service.validation.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { STORE_REQ_STATUS } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  ensureMatch,
  generateErrorMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import dayjs from "dayjs";

const validateWarehouseModeEnabled = async (): Promise<void> => {
  const settings = await settingsService.getSettings(true);

  const isWarehouseModeEnabled = settings?.warehouseMode;

  if (!isWarehouseModeEnabled) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Warehouse mode is not enabled")
    );
  }
};

export const validateIdBranchRequisition = async (id: number) => {
  logger.info("entering::validateIdBranchRequisition::service::validation");

  validIdCheck(id);

  const branchReq = await validateBranchRequisitionByIdFromDb(id);

  if (!branchReq) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Branch Requisition")
    );
  }

  logger.info("exiting::validateIdBranchRequisition::service::validation");

  return branchReq;
};

export const validateBranchRequisitionCommon = async (
  body: CreateBranchRequisitionInput
): Promise<void> => {
  logger.info("entering::validateBranchRequisitionCommon::service::validation");

  validateWarehouseModeEnabled();
  await validateWarehouseId(body.ccId);
  await validateIdBranch(body.branchId);
  const location = await validateIdBranch(body.locationId);

  if (!location.isMain) {
    if (body.locationId !== body.branchId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("ACCESS_FAIL", "Branch Location")
      );
    }
  }

  const user = await employeeService.getEmployeeByIdFrmCacheOrDb(
    body.requisitionFrom
  );
  if (!user) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "User"));
  }

  if (
    body.branchReqStatus &&
    body.branchReqStatus !== "Pending" &&
    body.branchReqStatus !== "Draft"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch requisition")
    );
  }

  const itemIds: number[] = body.branchRequisitionDetails.map(
    (d: BranchRequisitionDetailInput) => d.itemId
  );

  const uniqueItemIds = [...new Set(itemIds)];

  const items = await getCountItemsFromDb(uniqueItemIds);

  if (items.length !== uniqueItemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  logger.info("exiting::validateBranchRequisitionCommon::service::validation");
};

export const createBranchRequisitionServiceValidation = async (
  body: CreateBranchRequisitionInput
) => {
  logger.info(
    "entering::createBranchRequisitionServiceValidation::service::validation"
  );

  await validateBranchRequisitionCommon(body);

  logger.info(
    "exiting::createBranchRequisitionServiceValidation::service::validation"
  );
};

export const updateBranchRequisitionServiceValidation = async (
  body: CreateBranchRequisitionInput
) => {
  logger.info(
    "entering::updateBranchRequisitionServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  if (body.id == null) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Branch Requisition id")
    );
  }

  const currReq = await validateIdBranchRequisition(body.id);
  body.branchReq = currReq;

  if (
    currReq.branchReqStatus === "Approved" ||
    currReq.branchReqStatus === "Partially_Approved"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch requisition")
    );
  }

  ensureMatch(
    body.ccId,
    currReq.ccId,
    "Warehouse Id",
    "Branch Requisition Warehouse Id"
  );

  ensureMatch(
    body.requisitionFrom,
    currReq.requisitionFrom,
    "Requisition From User Id",
    "Branch Requisition User Id"
  );

  const updatedIds: number[] = body.branchRequisitionDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);

  const existingIds = currReq.branchRequisitionDetails.map((item) => item.id);

  const notInRequisitionDetails = updatedIds.filter(
    (id) => !existingIds.includes(id)
  );

  if (notInRequisitionDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        `Ids ${notInRequisitionDetails.join(
          ", "
        )} of Branch Requisition Details`
      )
    );
  }

  await validateBranchRequisitionCommon(body);

  logger.info(
    "exiting::updateBranchRequisitionServiceValidation::service::validation"
  );
};

export const rejectBranchRequisitionServiceValidation = async (
  body: RejectBranchRequisitionInput
) => {
  logger.info(
    "entering::rejectBranchRequisitionServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const currBranchReq = await validateIdBranchRequisition(body.id);

  await validateWarehouseId(body.ccId);

  ensureMatch(
    body.ccId,
    currBranchReq.ccId,
    "Warehouse Id",
    "Branch Requisition Warehouse Id"
  );

  if (
    currBranchReq.branchReqStatus !== "Pending" &&
    currBranchReq.branchReqStatus !== "Draft"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch requisition")
    );
  }

  logger.info(
    "exiting::rejectBranchRequisitionServiceValidation::service::validation"
  );
};

export const approveBranchRequisitionServiceValidation = async (
  body: ApproveBranchReqInput
) => {
  logger.info(
    "entering::approveBranchRequisitionServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const currBranchReq = await validateIdBranchRequisition(body.branchReqId);
  body.branchReq = currBranchReq;

  await validateWarehouseId(body.ccId);

  ensureMatch(
    body.ccId,
    currBranchReq.ccId,
    "Warehouse Id",
    "Branch Requisition Warehouse Id"
  );

  ensureMatch(
    body.brNumber,
    currBranchReq.brNumber,
    "Branch Requisition Number",
    "Branch Requisition Number"
  );

  if (
    currBranchReq.branchReqStatus !== "Pending" &&
    currBranchReq.branchReqStatus !== "Partially_Approved"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch requisition")
    );
  }

  let totalAssignQty = 0;

  for (const [index, detail] of body.assignItems.entries()) {
    const brDetails = currBranchReq.branchRequisitionDetails.find(
      (elem) => elem.id === detail.branchRequisitionDetailsId
    );

    if (!brDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "NOT_FOUND",
          `Branch requisition detail for item ${index + 1}`
        )
      );
    }

    totalAssignQty += detail.assignedQty;

    ensureMatch(
      detail.itemId,
      brDetails.itemId,
      `Assign Item ${index + 1} Item Id`,
      "Branch Requisition Detail Item Id"
    );

    const assignQty = body.assignItems.reduce((acc, item) => {
      if (
        item.branchRequisitionDetailsId === detail.branchRequisitionDetailsId
      ) {
        return acc + item.assignedQty;
      }

      return acc;
    }, 0);

    if (brDetails.reqQuantity < assignQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Assign Quantity")
      );
    }

    const stock = await getStockById(detail.itemStockId);

    if (!stock) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Item Stock")
      );
    }

    ensureMatch(
      detail.itemId,
      stock.itemId,
      `Assign Item ${index + 1} Item Id`,
      "Item Stock Item Id"
    );

    ensureMatch(
      body.ccId,
      stock.ccId,
      `Assign Item ${index + 1} Warehouse Id`,
      "Item Stock Warehouse Id"
    );

    ensureMatch(
      detail.isFoc,
      stock.isFoc,
      `Assign Item ${index + 1} FOC`,
      "Item Stock FOC"
    );

    if (detail.isBatch) {
      ensureMatch(
        detail.batchNo ?? null,
        stock.batchNo ?? null,
        `Assign Item ${index + 1} Batch No`,
        "Item Stock Batch No"
      );
    }

    if (detail.isExpiry) {
      const bodyExpiryDate = detail.expiryDate
        ? dayjs(detail.expiryDate).format("YYYY-MM-DD")
        : null;

      const stockExpiryDate = stock.expiryDate
        ? dayjs(stock.expiryDate).format("YYYY-MM-DD")
        : null;

      ensureMatch(
        bodyExpiryDate,
        stockExpiryDate,
        `Assign Item ${index + 1} Expiry Date`,
        "Item Stock Expiry Date"
      );
    }

    if (stock.quantity < detail.assignedQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INSUFFICIENT_STOCK",
          `Batch no : ${detail.batchNo ?? "-"}`
        )
      );
    }
  }

  const totalReqQty = currBranchReq.branchRequisitionDetails.reduce(
    (acc, details) => acc + details.reqQuantity,
    0
  );

  const alreadyAssignedQty = currBranchReq.branchRequisitionDetails.reduce(
    (acc, details) => acc + details.assignedQuantity,
    0
  );

  const alreadyAckQty = currBranchReq.branchRequisitionDetails.reduce(
    (acc, details) => acc + details.acknowledgedQuantity,
    0
  );

  if (totalAssignQty + alreadyAssignedQty > totalReqQty) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Item Total quantity")
    );
  } else if (totalAssignQty + alreadyAssignedQty < totalReqQty) {
    body.branchReqStatus = "Partially_Approved";
  } else {
    body.branchReqStatus = "Approved";
  }

  if (
    currBranchReq.branchReqAckStatus === "ACK_RECEIVED" &&
    totalAssignQty + alreadyAssignedQty > alreadyAckQty
  ) {
    body.branchReqAckStatus = "ACK_PARTIALLY_RECEIVED";
  }

  logger.info(
    "exiting::approveBranchRequisitionServiceValidation::service::validation"
  );
};

export const acknowledgeBranchRequisitionServiceValidation = async (
  body: AcknowledgeBranchRequisition
) => {
  logger.info(
    "entering::acknowledgeBranchRequisitionServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const currBranchReq = await validateIdBranchRequisition(body.branchReqId);
  body.branchReq = currBranchReq;

  await validateIdBranch(body.branchId);

  ensureMatch(
    body.branchId,
    currBranchReq.branchId,
    "Current Branch Id",
    "Branch Requisition Branch Id"
  );

  ensureMatch(
    body.brNumber,
    currBranchReq.brNumber,
    "Branch Requisition Number",
    "Branch Requisition Number"
  );

  if (
    currBranchReq.branchReqStatus !== "Approved" &&
    currBranchReq.branchReqStatus !== "Partially_Approved"
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch requisition status")
    );
  }

  if (currBranchReq.branchReqAckStatus === "ACK_RECEIVED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_STATUS",
        "Branch requisition acknowledge status"
      )
    );
  }

  let currTotalAckQty = 0;

  for (const [index, detail] of body.acknowledgeItems.entries()) {
    currTotalAckQty += detail.totalAcknowledgeQty;

    const brDetails = currBranchReq.branchRequisitionDetails.find(
      (elem) => elem.id === detail.branchRequisitionDetailsId
    );

    if (!brDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "NOT_FOUND",
          `Branch requisition detail for item ${index + 1}`
        )
      );
    }

    ensureMatch(
      detail.itemId,
      brDetails.itemId,
      `Acknowledge Item ${index + 1} Item Id`,
      "Branch Requisition Detail Item Id"
    );

    let totalAckQty = 0;

    for (const [batchIndex, item] of detail.itemBatch.entries()) {
      const branchItem = await getBranchItemDetailsFromDb(item.branchItemId);

      if (!branchItem) {
        throw new ErrorHandler(
          404,
          generateErrorMessage(
            "NOT_FOUND",
            `Branch item detail for batch ${batchIndex + 1}`
          )
        );
      }

      ensureMatch(
        body.branchReqId,
        branchItem.branchRequisitionId,
        `Acknowledge Item ${index + 1} Branch Requisition Id`,
        "Branch Item Detail Branch Requisition Id"
      );

      ensureMatch(
        detail.branchRequisitionDetailsId,
        branchItem.branchRequisitionDetailsId,
        `Acknowledge Item ${index + 1} Branch Requisition Details Id`,
        "Branch Item Detail Branch Requisition Details Id"
      );

      ensureMatch(
        detail.itemId,
        branchItem.itemId,
        `Acknowledge Item ${index + 1} Item Id`,
        "Branch Item Detail Item Id"
      );

      if (item.isBatch) {
        ensureMatch(
          item.batchNo ?? null,
          branchItem.batchNo ?? null,
          `Acknowledge Item ${index + 1} Batch ${batchIndex + 1} Batch No`,
          "Branch Item Detail Batch No"
        );
      }

      if (item.isExpiry) {
        const bodyExpiryDate = item.expiryDate
          ? dayjs(item.expiryDate).format("YYYY-MM-DD")
          : null;

        const branchItemExpiryDate = branchItem.expiryDate
          ? dayjs(branchItem.expiryDate).format("YYYY-MM-DD")
          : null;

        ensureMatch(
          bodyExpiryDate,
          branchItemExpiryDate,
          `Acknowledge Item ${index + 1} Batch ${batchIndex + 1} Expiry Date`,
          "Branch Item Detail Expiry Date"
        );
      }

      ensureMatch(
        item.isFoc,
        branchItem.isFoc,
        `Acknowledge Item ${index + 1} Batch ${batchIndex + 1} FOC`,
        "Branch Item Detail FOC"
      );

      if (
        branchItem.assignedQty <
        branchItem.acknowledgedQty + item.acknowledgeQty
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_FIELD",
            `Acknowledge quantity for Batch no : ${item.batchNo ?? "-"}`
          )
        );
      } else if (
        branchItem.assignedQty >
        branchItem.acknowledgedQty + item.acknowledgeQty
      ) {
        item.isCompleted = false;
      } else {
        item.isCompleted = true;
      }

      totalAckQty += item.acknowledgeQty;
    }

    ensureMatch(
      detail.totalAcknowledgeQty,
      totalAckQty,
      `Acknowledge Item ${index + 1} Total Acknowledge Quantity`,
      "Calculated Total Acknowledge Quantity"
    );
  }

  const totalReqQty = currBranchReq.branchRequisitionDetails.reduce(
    (acc, details) => acc + details.reqQuantity,
    0
  );

  const totalAckQtyTill = currBranchReq.branchRequisitionDetails.reduce(
    (acc, details) => acc + details.acknowledgedQuantity,
    0
  );

  const totalAssignQty = currBranchReq.branchRequisitionDetails.reduce(
    (acc, details) => acc + details.assignedQuantity,
    0
  );

  if (totalReqQty < totalAckQtyTill + currTotalAckQty) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "Item Total quantity")
    );
  } else if (totalAssignQty === totalAckQtyTill + currTotalAckQty) {
    body.branchReqAckStatus = "ACK_RECEIVED";
  } else {
    body.branchReqAckStatus = "ACK_PARTIALLY_RECEIVED";
  }

  logger.info(
    "exiting::acknowledgeBranchRequisitionServiceValidation::service::validation"
  );
};

export const deleteBranchRequisitionServiceValidation = async (id: number) => {
  logger.info(
    "entering::deleteBranchRequisitionServiceValidation::service::validation"
  );

  validateWarehouseModeEnabled();

  const branchReq = await validateIdBranchRequisition(id);

  if (
    branchReq.branchReqStatus !== STORE_REQ_STATUS.Draft &&
    branchReq.branchReqStatus !== STORE_REQ_STATUS.Pending
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Branch requisition")
    );
  }

  logger.info(
    "exiting::deleteBranchRequisitionServiceValidation::service::validation"
  );
};
