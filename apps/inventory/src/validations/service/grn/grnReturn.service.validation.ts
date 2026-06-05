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
  ItemStockType,
  RETURN_STS,
} from "@repo/db/generated/prisma/client";
import {
  calculateGrnItemNetAmount,
  calculateGrnStockQty,
  calculation,
} from "@/utils/commonCalculation.utils.js";
import { settingsService } from "@/services/master/settings.service.js";
import { currencyService } from "@/services/master/currency.service.js";
import { applyGrnReturnRateConversion } from "@/utils/rateConversation.utils.js";

export const validateIdGrnReturn = async (id: number) => {
  logger.info("entering::validateIdGrnReturn service::validation");
  validIdCheck(id);
  const grnReturn = await getGrnReturnByIdFromDb(id);
  if (!grnReturn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return")
    );
  }
  logger.info("exiting::validateIdGrnReturn::service::validation");

  return grnReturn;
};

export const validateGrnReturnCommon = async (
  body: CreateGrnReturnInput
): Promise<void> => {
  logger.info("entering::validateGrnReturnCommon::service::validation");

  if (body.currencyId) {
    const currency = await currencyService.getCurrencyById(body.currencyId);
    if (!currency) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Currency")
      );
    }
  }

  const supplier = await itemSupplierService.getItemSupplierById(
    body.supplierId,
    true
  );
  if (!supplier) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Supplier"));
  }
  body.supplier = supplier;

  const settings = await settingsService.getSettings();

  const ccSettingsId = settings?.warehouseMode;
  let warehouse, branch;

  if (ccSettingsId) {
    warehouse = await warehouseService.getWarehouseById(body.ccId, true);
    if (!warehouse) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Warehouse")
      );
    }
  } else {
    branch = await branchService.getBranchByIdWoDTO(body.ccId, true);
    if (!branch) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Branch"));
    }
    if (!branch.isMain) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("ACCESS_FAIL", "Branch is not main")
      );
    }
  }
  const calculationMethod: CalculationMethod =
    settings?.grnCalculationMethod || "FINAL";
  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.grnPrecision ?? settings?.defaultPrecision ?? 2;
  const itemStockType: ItemStockType =
    settings?.itemStockType || ItemStockType.PACK_WISE;
  //Apply conversion rate to the body
  applyGrnReturnRateConversion(body, {
    roundFormat,
    precision,
  });

  if (ccSettingsId) {
    if (warehouse?.isMain === false) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("ACCESS_FAIL", "Warehouse")
      );
    }
  }

  const grn = await getGrnByIdFromDb(body.grnId);

  if (!grn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note")
    );
  }

  if (grn.poNumber !== body.poNumber) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        "Purchase Number",
        "Sending purchase number"
      )
    );
  }

  if (grn.poId !== body.poId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Purchase Id", "Sending purchase id")
    );
  }

  if (grn.grnNumber !== body.grnNumber) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Grn Number", "Sending grn number")
    );
  }

  const totalDiscount = body.netDiscount ?? 0;
  if (totalDiscount > body.totalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        "Total Discount cannot exceed Total Amount"
      )
    );
  }

  const paidAmount = body.paidAmount ?? 0;
  if (paidAmount > body.totalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        "Paid Amount cannot exceed total amount"
      )
    );
  }

  const itemIds: Set<number> = new Set(
    body.goodReceiveReturnDetails.map((d: GrnReturnDetailInput) => d.itemId)
  );
  for (const itemId of itemIds) {
    const itm = await itemMasterService.getItemMasterByIdWoDto(itemId, true);
    if (!itm) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Item ${itemId}`)
      );
    }
    if (itm.isReturnable === false) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemId} is not returnable`
        )
      );
    }
  }
  const grnDetailsItemIds = new Set(
    grn.goodReceiveDetails.map((d) => d.itemId)
  );

  const invalidGrnIds = Array.from(itemIds).filter(
    (id) => !grnDetailsItemIds.has(id)
  );
  if (invalidGrnIds.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_VALUE",
        `Item ID${invalidGrnIds.length > 1 ? "s" : ""} [${invalidGrnIds.join(
          ", "
        )}] not found in Good Receive Note details`
      )
    );
  }
  const existingItems = await getCountItemsFromDb(Array.from(itemIds));
  if (existingItems.length !== itemIds.size) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  let totalDetailAmounts = 0;

  for (const detail of body.goodReceiveReturnDetails) {
    const grnDetail = grn.goodReceiveDetails.find(
      (grnItem) => grnItem.id === detail.grnDetailId
    );

    if (!grnDetail) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Good Receive Note Details")
      );
    }

    const itemLabel = grnDetail.item?.item ?? `ID ${detail.itemId}`;
    const unitDefaultValue = Number(grnDetail.item?.unit?.defaultValue ?? 1);

    const grnQty = Number(grnDetail.quantity ?? 0);
    const grnFocQty = Number(grnDetail.focQuantity ?? 0);
    const totalGrnQty = grnQty + grnFocQty;

    const alreadyReturnedQty = Number(grnDetail.returnQuantity ?? 0);
    const availableReturnQty = totalGrnQty - alreadyReturnedQty;

    const alreadyReturnedPaidQty = Math.min(alreadyReturnedQty, grnQty);
    const alreadyReturnedFocQty = Math.max(alreadyReturnedQty - grnQty, 0);

    const availablePaidQty = Math.max(grnQty - alreadyReturnedPaidQty, 0);
    const availableFocQty = Math.max(grnFocQty - alreadyReturnedFocQty, 0);

    const inputPaidQty = Number(detail.quantity ?? 0);
    const inputFocQty = Number(detail.focQuantity ?? 0);

    let returnQty = inputPaidQty;
    let returnFocQty = inputFocQty;

    if (inputFocQty <= 0 && inputPaidQty > availablePaidQty) {
      returnQty = availablePaidQty;
      returnFocQty = inputPaidQty - availablePaidQty;
    }

    const totalReturnQty = returnQty + returnFocQty;

    if (totalReturnQty <= 0) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemLabel}: Return quantity must be greater than 0`
        )
      );
    }

    if (returnQty > availablePaidQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemLabel}: Paid Return Quantity (${returnQty}) exceeds available paid return quantity (${availablePaidQty})`
        )
      );
    }

    if (returnFocQty > availableFocQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemLabel}: FOC Return Quantity (${returnFocQty}) exceeds available FOC return quantity (${availableFocQty})`
        )
      );
    }

    if (totalReturnQty > availableReturnQty) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemLabel}: Return Quantity (${totalReturnQty}) exceeds available GRN return quantity (${availableReturnQty})`
        )
      );
    }

    detail.quantity = returnQty;
    detail.focQuantity = returnFocQty;

    detail.stockQuantity = calculateGrnStockQty({
      itemStockType,
      unitDefaultValue,
      quantity: totalReturnQty,
    });

    if (!body.isApproval) {
      if (Number(detail.grnQty) !== totalGrnQty) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: GRN Quantity (${detail.grnQty}) does not match total GRN quantity (${totalGrnQty})`
          )
        );
      }

      if (Number(grnDetail.orderQuantity) !== Number(detail.orderQty)) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: Ordered Quantity (${detail.orderQty}) does not match ordered quantity (${grnDetail.orderQuantity})`
          )
        );
      }

      const inHandQty = await getItemStockQtyByBatchWise({
        itemId: detail.itemId,
        ccId: grn.ccId,
        batchNo: detail.batchNo,
        expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : null,
      });

      if (Number(inHandQty) !== Number(detail.inHandQty)) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: In Hand Quantity (${detail.inHandQty}) does not match calculated in hand quantity (${inHandQty})`
          )
        );
      }

      const returnStockQty = Number(detail.stockQuantity ?? totalReturnQty);

      if (returnStockQty > Number(inHandQty)) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_VALUE",
            `Item ${itemLabel}: Return Stock Quantity (${returnStockQty}) exceeds in-hand stock quantity (${inHandQty})`
          )
        );
      }

      if (
        applyRound(Number(detail.purchasedPrice), roundFormat, precision) !==
        applyRound(Number(grnDetail.purchasedPrice), roundFormat, precision)
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Item ${itemLabel}: Purchased Price (${detail.purchasedPrice}) does not match Good Receive Note Detail (${grnDetail.purchasedPrice})`
          )
        );
      }

      const itemAmount = calculateGrnItemNetAmount({
        itemStockType,
        unitDefaultValue,
        purchasedPrice: Number(detail.purchasedPrice),
        quantity: returnQty,
        calculationMethod,
        roundFormat,
        precision,
      });

      const roundedItemAmount = applyRound(itemAmount, roundFormat, precision);
      const roundedDetailNetAmount = applyRound(
        Number(detail.netAmount),
        roundFormat,
        precision
      );

      if (roundedItemAmount !== roundedDetailNetAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Item ${itemLabel}: Net Amount (${roundedDetailNetAmount}) does not match calculated amount (${roundedItemAmount})`
          )
        );
      }
    }

    const discountAmount = detail.netDiscount ?? 0;
    if (Number(discountAmount) > Number(detail.netAmount)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Detail discount (${applyRound(
            Number(discountAmount),
            roundFormat,
            precision
          )}) cannot exceed detail netAmount (${applyRound(
            Number(detail.netAmount),
            roundFormat,
            precision
          )})`
        )
      );
    }

    const { totalAmount, netTax, netDiscount } = calculation({
      discountMethod: detail.discountMethod,
      discount: Number(detail.discount ?? 0),
      tax: detail.tax ?? 0,
      amount: Number(detail.netAmount),
      // taxMethod: detail.taxMethod,
      calculationMethod,
      precision,
      roundFormat,
    });

    const formattedTotalAmount = applyRound(
      totalAmount,
      roundFormat,
      precision
    );

    if (
      applyRound(Number(detail.totalAmount), roundFormat, precision) !==
      formattedTotalAmount
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${detail.itemId}: Total Amount (${
            detail.totalAmount
          }) does not match calculated net (${applyRound(
            totalAmount,
            roundFormat,
            precision
          )})`
        )
      );
    }

    if (
      applyRound(Number(detail.netTax), roundFormat, precision) !==
      applyRound(netTax, roundFormat, precision)
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${detail.itemId}: Net tax (${
            detail.netTax
          }) does not match calculated net (${applyRound(
            netTax,
            roundFormat,
            precision
          )})`
        )
      );
    }

    if (
      applyRound(Number(detail.netDiscount), roundFormat, precision) !==
      applyRound(netDiscount, roundFormat, precision)
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item ${detail.itemId}: Net Discount (${
            detail.netDiscount
          }) does not match calculated net (${applyRound(
            netDiscount,
            roundFormat,
            precision
          )})`
        )
      );
    }

    totalDetailAmounts += formattedTotalAmount;
  }

  if (
    applyRound(Number(body.netTotal), roundFormat, precision) !==
    applyRound(totalDetailAmounts, roundFormat, precision)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Amount (${body.netTotal}) does not match sum of detail totalAmounts (${totalDetailAmounts})`
      )
    );
  }

  const { netTax, totalAmount, netDiscount } = calculation({
    discountMethod: body.discountMethod,
    discount: body.discount ?? 0,
    amount: Number(body.netTotal),
    tax: body.tax ?? 0,
    // taxMethod: "EXCLUSIVE",
    calculationMethod,
    roundFormat,
    precision,
  });

  if (
    applyRound(Number(body.netTax), roundFormat, precision) !==
    applyRound(netTax, roundFormat, precision)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Tax (${body.netTax}) does not match calculated tax (${applyRound(
          netTax,
          roundFormat,
          precision
        )})`
      )
    );
  }

  if (
    applyRound(Number(body.netDiscount), roundFormat, precision) !==
    applyRound(netDiscount, roundFormat, precision)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Discount (${
          body.netDiscount
        }) does not match calculated discount (${applyRound(
          netDiscount,
          roundFormat,
          precision
        )})`
      )
    );
  }

  if (
    applyRound(Number(body.totalAmount), roundFormat, precision) !==
    applyRound(totalAmount, roundFormat, precision)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Total Amount (${
          body.totalAmount
        }) does not match calculated net total (${applyRound(
          totalAmount,
          roundFormat,
          precision
        )})`
      )
    );
  }

  logger.info("exiting::validateGrnReturnCommon::service::validation");
};

export const createGrnReturnServiceValidation = async (
  body: CreateGrnReturnInput
) => {
  logger.info(
    "entering::createGrnReturnServiceValidation::service::validation"
  );

  await validateGrnReturnCommon(body);

  logger.info("exiting::createGrnReturnServiceValidation::service::validation");
};

export const updateGrnReturnServiceValidation = async (
  body: CreateGrnReturnInput
) => {
  logger.info(
    "entering::updateGrnReturnServiceValidation::service::validation"
  );

  if (body.id == null) {
    logger.error("missing grnReturn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return id")
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
    (id) => !existingIds.includes(id)
  );
  if (notInStockTransferDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        `Id ${notInStockTransferDetails.join(", ")} of Stock Transfer Details`
      )
    );
  }

  await validateGrnReturnCommon(body);

  logger.info("exiting::updateGrnReturnServiceValidation::service::validation");
};

export const approveGrnReturnServiceValidation = async (
  body: CreateGrnReturnInput
) => {
  logger.info(
    "entering::approveGrnReturnServiceValidation::service::validation"
  );
  const settings = await settingsService.getSettings(true);

  if (body.id == null) {
    logger.error("missing grnReturn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return id")
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
        generateErrorMessage("MISMATCH", "Warehouse Id", "CC Id")
      );
    }
  } else {
    branch = await branchService.getBranchById(body.ccId, true);
    if (grnReturn.ccId !== body.ccId && branch?.isMain === false) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("MISMATCH", "Branch Id", "CC Id")
      );
    }
  }

  await warehouseService.getWarehouseById(body.ccId, true);
  await branchService.getBranchById(body.ccId, true);
  const detailIds = Array.from(
    new Set(
      body.goodReceiveReturnDetails
        .map((d) => d.id)
        .filter((id): id is number => id != null)
    )
  );

  if (detailIds.length > 0) {
    const count = await getCountGrnReturnDetailsFromDb(detailIds, body.id);
    if (count !== detailIds.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Good Receive Note Return details")
      );
    }
  }

  body.isApproval = true;
  if (grnReturn.status !== "PENDING") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note Return")
    );
  }

  await validateGrnReturnCommon(body);

  logger.info(
    "exiting::approveGrnReturnServiceValidation::service::validation"
  );
};

export const rejectGrnReturnServiceValidation = async (body: {
  id: number;
  grnId: number;
  ccId?: number;
}) => {
  logger.info(
    "entering::rejectGrnReturnServiceValidation::service::validation"
  );

  const settings = await settingsService.getSettings(true);

  if (body.id == null) {
    logger.error("missing grnReturn id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Good Receive Note Return id")
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
          generateErrorMessage("MISMATCH", "Warehouse Id", "CC Id")
        );
      }
    } else {
      branch = await branchService.getBranchById(body.ccId, true);
      if (grnReturn.ccId !== body.ccId && branch?.isMain === false) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("MISMATCH", "Branch Id", "CC Id")
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
        "Sending Good Receive Note Id"
      )
    );
  }

  if (grnReturn.status !== "PENDING") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note Return")
    );
  }

  logger.info("exiting::rejectGrnReturnServiceValidation::service::validation");
};

export const deleteGrnReturnServiceValidation = async (id: number) => {
  logger.info("entering::deleteGrnReturn::service::validation");

  const grnReturn = await validateIdGrnReturn(id);

  if (grnReturn.status !== RETURN_STS.PENDING) {
    logger.error(
      `Cannot delete Good Receive Note Return with id=${id} in status=${grnReturn.status}`
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Good Receive Note Return")
    );
  }

  logger.info("exiting::deleteGrnReturn::service::validation");
};
