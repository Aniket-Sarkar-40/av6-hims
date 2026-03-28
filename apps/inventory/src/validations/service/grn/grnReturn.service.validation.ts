import { getGrnByIdFromDb } from "@/repository/grn/grn.repository.js";
import {
  getCountGrnReturnDetailsFromDb,
  getGrnReturnByIdFromDb,
} from "@/repository/grn/grnReturn.repository.js";
import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  CreateGrnReturnInput,
  GrnReturnDetailInput,
} from "@/types/grn/grnReturn.js";
import { applyRound } from "av6-utils";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  CalculationMethod,
  RETURN_STS,
} from "@repo/db/generated/prisma/client";
import { calculation } from "@/utils/commonCalculation.utils.js";
import { settingsService } from "@/services/master/settings.service.js";

export const validateIdGrnReturn = async (id: number) => {
  logger.info("entering::validateIdGrnReturn service::validation");
  validIdCheck(id);
  const grnReturn = await getGrnReturnByIdFromDb(id);
  if (!grnReturn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return"),
    );
  }
  logger.info("exiting::validateIdGrnReturn::service::validation");

  return grnReturn;
};

export const validateGrnReturnCommon = async (
  body: CreateGrnReturnInput,
): Promise<void> => {
  logger.info("entering::validateGrnReturnCommon::service::validation");
  const settings = await settingsService.getSettings(true);

  const supplier = await itemSupplierService.getItemSupplierById(
    body.supplierId,
    true,
  );
  if (!supplier) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Supplier"));
  }
  body.supplier = supplier;

  const ccSettingsId = settings?.warehouseMode;
  let warehouse, branch;

  if (ccSettingsId) {
    warehouse = await warehouseService.getWarehouseById(body.ccId, true);
    if (!warehouse) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Warehouse"),
      );
    }
  } else {
    branch = await branchService.getBranchById(body.ccId, true);
    if (!branch) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Branch"));
    }
  }

  const calculationMethod: CalculationMethod =
    settings?.grnCalculationMethod || "FINAL";
  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;

  if (ccSettingsId) {
    if (warehouse?.isMain === false) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("ACCESS_FAIL", "Warehouse"),
      );
    }
  }

  const grn = await getGrnByIdFromDb(body.grnId);

  if (!grn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note"),
    );
  }

  if (grn.poNumber !== body.poNumber) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        "Purchase Number",
        "Sending purchase number",
      ),
    );
  }

  if (grn.poId !== body.poId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Purchase Id", "Sending purchase id"),
    );
  }

  if (grn.grnNumber !== body.grnNumber) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Grn Number", "Sending grn number"),
    );
  }

  const totalDiscount = body.netDiscount ?? 0;
  if (totalDiscount > body.totalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        "Total Discount cannot exceed Total Amount",
      ),
    );
  }

  const paidAmount = body.paidAmount ?? 0;
  if (paidAmount > body.totalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        "Paid Amount cannot exceed total amount",
      ),
    );
  }

  const itemIds: Set<number> = new Set(
    body.goodReceiveReturnDetails.map((d: GrnReturnDetailInput) => d.itemId),
  );
  for (const itemId of itemIds) {
    const itm = await itemMasterService.getItemMasterByIdWoDto(itemId, true);
    if (!itm) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Item ${itemId}`),
      );
    }
    if (itm.isReturnable === false) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemId} is not returnable`,
        ),
      );
    }
  }
  const grnDetailsItemIds = new Set(
    grn.goodReceiveDetails.map((d) => d.itemId),
  );

  const invalidGrnIds = Array.from(itemIds).filter(
    (id) => !grnDetailsItemIds.has(id),
  );
  if (invalidGrnIds.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        `Item ID${invalidGrnIds.length > 1 ? "s" : ""} [${invalidGrnIds.join(", ")}] not found in Good Receive Note details`,
      ),
    );
  }
  const existingItems = await getCountItemsFromDb(Array.from(itemIds));
  if (existingItems.length !== itemIds.size) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  let totalDetailAmounts = 0;

  for (const detail of body.goodReceiveReturnDetails) {
    if (!body.isApproval) {
      const grnDetail = grn.goodReceiveDetails.find(
        (grnItem) => grnItem.id === detail.grnDetailId,
      );

      if (!grnDetail) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Good Receive Note Details"),
        );
      }

      const itemLabel =
        (grnDetail as unknown as { item?: { item?: string } })?.item?.item ??
        `ID ${detail.itemId}`;

      if (grnDetail.quantity !== detail.grnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: GRN Quantity (${detail.grnQty}) does not match GRN quantity (${grnDetail.quantity})`,
          ),
        );
      }

      if (grnDetail.orderQuantity !== detail.orderQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: Ordered Quantity (${detail.orderQty}) does not match ordered quantity (${grnDetail.orderQuantity})`,
          ),
        );
      }

      const finalQuantity = grnDetail.quantity - grnDetail.returnQuantity;

      const inHandQty = await getItemStockQtyByBatchWise({
        itemId: detail.itemId,
        ccId: grn.ccId,
        batchNo: detail.batchNo,
        expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : null,
      });

      if (inHandQty !== detail.inHandQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: In Hand Quantity (${detail.inHandQty}) does not match calculated in hand quantity (${inHandQty})`,
          ),
        );
      }

      if (
        detail.quantity !== undefined &&
        detail.quantity > Math.min(finalQuantity, inHandQty)
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_VALUE",
            `Item ${itemLabel}: Quantity in GRN (${detail.quantity}) exceeds return quantity (${Math.min(finalQuantity, inHandQty)}) in Good Receive Note Return`,
          ),
        );
      }

      if (detail.purchasedPrice !== grnDetail.purchasedPrice) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Item ${itemLabel}: Purchased Price (${detail.purchasedPrice}) does not match Good Receive Note Detail (${grnDetail.purchasedPrice})`,
          ),
        );
      }

      if (detail.quantity === undefined) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_VALUE",
            `Item ${itemLabel}: Quantity is required for amount calculation`,
          ),
        );
      }

      let itemAmount = detail.quantity * detail.purchasedPrice;
      itemAmount =
        calculationMethod === "STEP_WISE"
          ? applyRound(itemAmount, roundFormat, precision)
          : itemAmount;

      if (applyRound(itemAmount, roundFormat, precision) !== detail.netAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: Net Amount (${detail.netAmount}) does not match calculated amount (${applyRound(itemAmount, roundFormat, precision)})`,
          ),
        );
      }
    }
    const discountAmount = detail.netDiscount ?? 0;
    if (discountAmount > detail.netAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Detail discount (${discountAmount}) cannot exceed detail netAmount (${detail.netAmount})`,
        ),
      );
    }

    const { totalAmount, netTax, netDiscount } = calculation({
      discountMethod: detail.discountMethod,
      discount: detail.discount ?? 0,
      tax: detail.tax ?? 0,
      amount: detail.netAmount,
      // taxMethod: detail.taxMethod,
      calculationMethod,
      precision,
      roundFormat,
    });

    const formattedTotalAmount = applyRound(
      totalAmount,
      roundFormat,
      precision,
    );

    if (detail.totalAmount !== formattedTotalAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${detail.itemId}: Total Amount (${detail.totalAmount}) does not match calculated net (${applyRound(totalAmount, roundFormat, precision)})`,
        ),
      );
    }

    if (detail.netTax !== applyRound(netTax, roundFormat, precision)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${detail.itemId}: Net tax (${detail.netTax}) does not match calculated net (${applyRound(netTax, roundFormat, precision)})`,
        ),
      );
    }

    if (
      detail.netDiscount !== applyRound(netDiscount, roundFormat, precision)
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${detail.itemId}: Net Discount (${detail.netDiscount}) does not match calculated net (${applyRound(netDiscount, roundFormat, precision)})`,
        ),
      );
    }

    totalDetailAmounts += formattedTotalAmount;
  }

  if (
    body.netTotal !== applyRound(totalDetailAmounts, roundFormat, precision)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Amount (${body.netTotal}) does not match sum of detail totalAmounts (${totalDetailAmounts})`,
      ),
    );
  }

  const { netTax, totalAmount, netDiscount } = calculation({
    discountMethod: body.discountMethod,
    discount: body.discount ?? 0,
    amount: body.netTotal,
    tax: body.tax ?? 0,
    // taxMethod: "EXCLUSIVE",
    calculationMethod,
    roundFormat,
    precision,
  });

  if (body.netTax !== applyRound(netTax, roundFormat, precision)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Tax (${body.netTax}) does not match calculated tax (${applyRound(netTax, roundFormat, precision)})`,
      ),
    );
  }

  if (body.netDiscount !== applyRound(netDiscount, roundFormat, precision)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Discount (${body.netDiscount}) does not match calculated discount (${applyRound(netDiscount, roundFormat, precision)})`,
      ),
    );
  }

  if (body.totalAmount !== applyRound(totalAmount, roundFormat, precision)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Total Amount (${body.totalAmount}) does not match calculated net total (${applyRound(totalAmount, roundFormat, precision)})`,
      ),
    );
  }

  logger.info("exiting::validateGrnReturnCommon::service::validation");
};

export const createGrnReturnServiceValidation = async (
  body: CreateGrnReturnInput,
) => {
  logger.info(
    "entering::createGrnReturnServiceValidation::service::validation",
  );

  await validateGrnReturnCommon(body);

  logger.info("exiting::createGrnReturnServiceValidation::service::validation");
};

export const updateGrnReturnServiceValidation = async (
  body: CreateGrnReturnInput,
) => {
  logger.info(
    "entering::updateGrnReturnServiceValidation::service::validation",
  );

  if (body.id == null) {
    logger.error("missing grnReturn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return id"),
    );
  }
  logger.info(`validating existence of grnReturn id=${body.id}`);
  const grnReturn = await validateIdGrnReturn(body.id);
  body.grnReturn = grnReturn;

  const updatedIds: number[] = body.goodReceiveReturnDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in stock transfer details
  const existingIds = grnReturn.goodReceiveReturnDetails.map((item) => item.id);
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

  await validateGrnReturnCommon(body);

  logger.info("exiting::updateGrnReturnServiceValidation::service::validation");
};

export const approveGrnReturnServiceValidation = async (
  body: CreateGrnReturnInput,
) => {
  logger.info(
    "entering::approveGrnReturnServiceValidation::service::validation",
  );
  const settings = await settingsService.getSettings(true);

  if (body.id == null) {
    logger.error("missing grnReturn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return id"),
    );
  }
  logger.info(`validating existence of grnReturn id=${body.id}`);

  const grnReturn = await validateIdGrnReturn(body.id);

  const ccSettingsId = settings?.warehouseMode;
  let warehouse, branch;

  if (ccSettingsId) {
    warehouse = await warehouseService.getWarehouseById(body.ccId, true);
    if (grnReturn.ccId !== body.ccId && warehouse?.isMain === false) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("MISMATCH", "Warehouse Id", "CC Id"),
      );
    }
  } else {
    branch = await branchService.getBranchById(body.ccId, true);
    if (grnReturn.ccId !== body.ccId && branch?.isMain === false) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("MISMATCH", "Branch Id", "CC Id"),
      );
    }
  }

  await warehouseService.getWarehouseById(body.ccId, true);
  await branchService.getBranchById(body.ccId, true);
  const detailIds = Array.from(
    new Set(
      body.goodReceiveReturnDetails
        .map((d) => d.id)
        .filter((id): id is number => id != null),
    ),
  );

  if (detailIds.length > 0) {
    const count = await getCountGrnReturnDetailsFromDb(detailIds, body.id);
    if (count !== detailIds.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Good Receive Note Return details"),
      );
    }
  }

  body.isApproval = true;
  if (grnReturn.status !== "PENDING") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note Return"),
    );
  }

  await validateGrnReturnCommon(body);

  logger.info(
    "exiting::approveGrnReturnServiceValidation::service::validation",
  );
};

export const rejectGrnReturnServiceValidation = async (body: {
  id: number;
  grnId: number;
  ccId?: number;
}) => {
  logger.info(
    "entering::rejectGrnReturnServiceValidation::service::validation",
  );

  const settings = await settingsService.getSettings(true);

  if (body.id == null) {
    logger.error("missing grnReturn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return id"),
    );
  }
  logger.info(`validating existence of grnReturn id=${body.id}`);

  const grnReturn = await validateIdGrnReturn(body.id);

  if (body.ccId) {
    const ccSettingsId = settings?.warehouseMode;
    let warehouse, branch;

    if (ccSettingsId) {
      warehouse = await warehouseService.getWarehouseById(body.ccId, true);
      if (grnReturn.ccId !== body.ccId && warehouse?.isMain === false) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("MISMATCH", "Warehouse Id", "CC Id"),
        );
      }
    } else {
      branch = await branchService.getBranchById(body.ccId, true);
      if (grnReturn.ccId !== body.ccId && branch?.isMain === false) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("MISMATCH", "Branch Id", "CC Id"),
        );
      }
    }
  }

  if (grnReturn.grnId !== body.grnId) {
    throw new ErrorHandler(
      404,
      generateErrorMessage(
        "MISMATCH",
        "Good Receive Note Id",
        "Sending Good Receive Note Id",
      ),
    );
  }

  if (grnReturn.status !== "PENDING") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note Return"),
    );
  }

  logger.info("exiting::rejectGrnReturnServiceValidation::service::validation");
};

export const deleteGrnReturnServiceValidation = async (id: number) => {
  logger.info("entering::deleteGrnReturn::service::validation");

  const grnReturn = await validateIdGrnReturn(id);

  if (grnReturn.status !== RETURN_STS.PENDING) {
    logger.error(
      `Cannot delete Good Receive Note Return with id=${id} in status=${grnReturn.status}`,
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note Return"),
    );
  }

  logger.info("exiting::deleteGrnReturn::service::validation");
};
