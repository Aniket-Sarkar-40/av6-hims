import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  getCountGRNDetailsFromDb,
  getGrnByIdFromDb,
} from "@/repository/grn/grn.repository.js";
import { getPurchaseByIdFromDb } from "@/repository/purchase/purchase.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { CreateGrnInput } from "@/types/grn/grn.js";
import { applyRound } from "av6-utils";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  CalculationMethod,
  GRN_STATUS,
  PO_STATUS,
} from "@repo/db/generated/prisma/client";
import { calculation } from "@/utils/commonCalculation.utils.js";
import { settingsService } from "@/services/master/settings.service.js";

export const validateIdGrn = async (id: number) => {
  logger.info("entering::validateIdGrn service::validation");
  validIdCheck(id);
  const po = await getGrnByIdFromDb(id);
  if (!po) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note"),
    );
  }
  logger.info("exiting::validateIdGrn::service::validation");

  return po;
};

export const validateGrnCommon = async (
  body: CreateGrnInput,
): Promise<void> => {
  logger.info("entering::validateGrnCommon::service::validation");
  const settings = await settingsService.getSettings(true);

  const itemSupplier = await itemSupplierService.getItemSupplierById(
    body.supplierId,
    true,
  );
  if (!itemSupplier) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Supplier"));
  }
  body.supplier = itemSupplier;
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

  validIdCheck(body.poId);

  if (ccSettingsId) {
    if (warehouse?.isMain === false) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("ACCESS_FAIL", "Warehouse"),
      );
    }
  }

  const existingPO = await getPurchaseByIdFromDb(body.poId);
  if (!existingPO) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Purchase Order"),
    );
  }

  if (existingPO.poNumber !== body.poNumber) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        "Purchase Order ID and Number",
        " Sending PO Number",
      ),
    );
  }

  if (existingPO.supplierId !== body.supplierId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Supplier ID", "Sending Supplier ID"),
    );
  }

  if (ccSettingsId) {
    if (existingPO.ccId !== body.ccId && warehouse?.isMain === false) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "MISMATCH",
          "Warehouse ID",
          "Sending Warehouse ID",
        ),
      );
    }
  } else {
    if (existingPO.ccId !== body.ccId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("MISMATCH", "Branch ID", "Sending Branch ID"),
      );
    }
  }

  // Validate discounts
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

  // Validate Item IDs between GRN and PO
  const grnItemIds = new Set(body.goodReceiveDetails.map((d) => d.itemId));
  const poItemIds = new Set(
    existingPO.purchaseOrderDetails.map((d) => d.itemId),
  );
  const invalidIds = Array.from(grnItemIds).filter((id) => !poItemIds.has(id));

  if (invalidIds.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        `Item ID${invalidIds.length > 1 ? "s" : ""} [${invalidIds.join(", ")}] not found in Purchase Order details`,
      ),
    );
  }

  if (grnItemIds.size > poItemIds.size) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        `GRN contains ${grnItemIds.size} items but PO only has ${poItemIds.size}`,
      ),
    );
  }

  let totalDetailAmounts = 0;

  // Validate each GRN item against PO details
  for (const detail of body.goodReceiveDetails) {
    const poDetail = existingPO.purchaseOrderDetails.find(
      (poItem) => poItem.id === detail.poDetailsId,
    );

    if (poDetail) {
      const itemLabel = poDetail?.item?.item ?? `ID ${detail.itemId}`;
      const finalQuantity = poDetail.quantity - poDetail.receivedQty;

      if (detail.quantity !== undefined && detail.quantity > finalQuantity) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_VALUE",
            `Item ${itemLabel}: Quantity in GRN (${detail.quantity}) exceeds order quantity (${finalQuantity}) in Purchase Order`,
          ),
        );
      }
      detail.orderQuantity = poDetail.quantity;
    } else {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order Details"),
      );
    }

    // Validate price mismatch
    if (detail.purchasedPrice !== poDetail.purchasedPrice) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${poDetail?.item?.item ?? `ID ${detail.itemId}`}: Purchased Price (${detail.purchasedPrice}) does not match Purchase Order Price (${poDetail.purchasedPrice})`,
        ),
      );
    }

    let itemAmount = poDetail.purchasedPrice * (detail.quantity ?? 0);

    // Adjust for calculation method
    itemAmount =
      calculationMethod === "STEP_WISE"
        ? applyRound(itemAmount, roundFormat, precision)
        : itemAmount;

    if (applyRound(itemAmount, roundFormat, precision) !== detail.netAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${poDetail?.item?.item ?? `ID ${detail.itemId}`}: Item Amount (${applyRound(itemAmount, roundFormat, precision)}) does not match net amount (${detail.netAmount})`,
        ),
      );
    }

    const { totalAmount, netTax, netDiscount } = calculation({
      // taxMethod: detail.taxMethod,
      discountMethod: detail.discountMethod,
      discount: detail.discount ?? 0,
      tax: detail.tax ?? 0,
      amount: detail.netAmount,
      calculationMethod,
      roundFormat,
      precision: precision || 2,
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
          `Item ${poDetail?.item?.item ?? `ID ${detail.itemId}`}: Total Amount (${detail.totalAmount}) does not match calculated total amount (${formattedTotalAmount})`,
        ),
      );
    }

    if (detail.netTax !== applyRound(netTax, roundFormat, precision)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${poDetail?.item?.item ?? `ID ${detail.itemId}`}: Net tax (${detail.netTax}) does not match calculated net tax (${applyRound(netTax, roundFormat, precision)})`,
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
          `Item ${poDetail?.item?.item ?? `ID ${detail.itemId}`}: Net Discount (${detail.netDiscount}) does not match calculated net discount (${applyRound(netDiscount, roundFormat, precision)})`,
        ),
      );
    }

    totalDetailAmounts += formattedTotalAmount;
  }

  // Validate total amounts across GRN
  if (
    body.netTotal !== applyRound(totalDetailAmounts, roundFormat, precision)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Amount (${body.netTotal}) does not match sum of detail total amounts (${applyRound(totalDetailAmounts, roundFormat, precision)})`,
      ),
    );
  }

  // Recalculate based on GRN details
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

  // Validate tax, discount, and total amounts
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

  // Validate paid amount
  const paidAmount = body.paidAmount ?? 0;
  if (paidAmount > body.totalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        "Paid Amount cannot exceed Total Amount",
      ),
    );
  }

  // Validate quantity matches remaining PO quantity
  const remainingTotalPOQty = existingPO.purchaseOrderDetails.reduce(
    (acc, curr) => (acc += curr.quantity - (curr.receivedQty ?? 0)),
    0,
  );
  const totalGRNQty = body.goodReceiveDetails.reduce(
    (acc, curr) => (acc += curr.quantity ?? 0),
    0,
  );

  if (remainingTotalPOQty < totalGRNQty) {
    throw new ErrorHandler(
      400,
      "Total Quantity of GRN items must be less than or equal to the total quantity of PO.",
    );
  } else if (remainingTotalPOQty > totalGRNQty) {
    body.poStatus = PO_STATUS.PARTIALLY_RECEIVED;
  } else {
    body.poStatus = PO_STATUS.RECEIVED;
  }

  logger.info("exiting::validateGrnCommon::service::validation");
};

export const createGrnServiceValidation = async (body: CreateGrnInput) => {
  logger.info("entering::createGrnServiceValidation::service::validation");

  await validateGrnCommon(body);

  logger.info("exiting::createGrnServiceValidation::service::validation");
};

export const updateGrnServiceValidation = async (body: CreateGrnInput) => {
  logger.info("entering::updateGrnServiceValidation::service::validation");

  if (body.id == null) {
    logger.error("missing grn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note id"),
    );
  }
  logger.info(`validating existence of grn id=${body.id}`);
  await validateIdGrn(body.id);

  const detailIds = body.goodReceiveDetails
    .map((d) => d.id)
    .filter((id): id is number => id != null);

  if (detailIds.length > 0) {
    const count = await getCountGRNDetailsFromDb(detailIds, body.id);
    if (count !== detailIds.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Good Receive Note details"),
      );
    }
  }

  await validateGrnCommon(body);

  logger.info("exiting::updateGrnServiceValidation::service::validation");
};

export const deleteGrnServiceValidation = async (id: number) => {
  logger.info("entering::deleteGrnServiceValidation::service::validation");

  const grn = await validateIdGrn(id);

  if (grn.status !== GRN_STATUS.DRAFT) {
    logger.error(
      `Cannot delete Good Receive Note with id=${id} in status=${grn.status}`,
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note"),
    );
  }
  logger.info("exiting::deleteGrnServiceValidation::service::validation");
};
