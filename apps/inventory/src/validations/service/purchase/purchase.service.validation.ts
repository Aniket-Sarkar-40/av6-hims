import { requestStorage } from "@repo/platform/config/requestContext.js";
import { getCountItemsFromDb } from "@/repository/master/itemMaster.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { purchaseService } from "@/services/purchase/purchase.service.js";
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrder,
} from "@/types/purchase/purchase.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { applyRound } from "av6-utils";
import {
  CalculationMethod,
  ItemStockType,
  PO_STATUS,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { validateIdItemSupplier } from "../master/itemSupplier.service.validation.js";
import { itemStoreService } from "@/services/master/itemStore.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { getItemSupplierMapFromDb } from "@/repository/itemSupplierMap/itemSupplierMap.repository.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";

const calculatePurchaseOrderItemTotal = ({
  itemStockType,
  unitDefaultValue,
  purchasedPrice,
  quantity,
  calculationMethod,
  roundFormat,
  precision,
}: {
  itemStockType: ItemStockType;
  unitDefaultValue: unknown;
  purchasedPrice: unknown;
  quantity: unknown;
  calculationMethod: CalculationMethod;
  roundFormat: RoundFormat;
  precision: number;
}) => {
  const price = Number(purchasedPrice);
  const qty = Number(quantity);
  const defaultValue = Number(unitDefaultValue);

  let total = price * qty;

  if (itemStockType === ItemStockType.EACH_WISE) {
    total = defaultValue * price * qty;
  }

  return calculationMethod === CalculationMethod.STEP_WISE
    ? applyRound(total, roundFormat, precision)
    : total;
};

export const validateIdPO = async (id: number) => {
  logger.info("entering::validateIdPO service::validation");
  validIdCheck(id);
  const po = await purchaseService.getPurchaseById(id);
  if (!po) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Purchase Order")
    );
  }
  logger.info("exiting::validateIdPO::service::validation");

  return po;
};

export const validatePurchaseOrderCommon = async (
  body: CreatePurchaseOrderInput
): Promise<void> => {
  logger.info("entering::validatePurchaseOrderCommon::service::validation");

  const settings = await settingsService.getSettings();
  const calculationMethod: CalculationMethod =
    settings?.poCalculationMethod || "STEP_WISE";
  const roundFormat = settings?.poRoundedFormat || "TO_FIXED";
  const precision = settings?.poPrecision ?? settings?.defaultPrecision ?? 2;
  const itemStockType: ItemStockType =
    settings?.itemStockType || ItemStockType.PACK_WISE;

  if (body.currencyId) {
    const currency = await currencyService.getCurrencyById(body.currencyId);
    if (!currency) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Currency")
      );
    }
  }

  const warehouseMode = settings?.warehouseMode;
  const supplierMode = settings?.supplierMode;
  if (warehouseMode) {
    const warehouse = await warehouseService.getWarehouseById(body.ccId);

    if (!warehouse) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Warehouse")
      );
    }
  } else {
    const branch = await branchService.getBranchById(body.ccId);
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

  const store = body.storeId
    ? await itemStoreService.getItemStoreById(body.storeId, true)
    : null;
  if (!store) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store"));
  }

  const supplier = await itemSupplierService.getItemSupplierById(
    body.supplierId
  );
  body.supplier = supplier;
  await validateIdItemSupplier(body.supplierId);

  const itemIds = [...new Set(body.purchaseOrderDetails.map((d) => d.itemId))];

  const items = await getCountItemsFromDb(itemIds);

  if (items.length !== itemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  let sumOfProductsTotal = 0;
  for (const detail of body.purchaseOrderDetails) {
    if (supplierMode) {
      const mapping = await getItemSupplierMapFromDb({
        itemId: detail.itemId,
        supplierId: body.supplierId,
        ccId: body.ccId,
      });
      const supplierPrice = mapping ? Number(mapping.purchasePrice) : undefined;
      const itemBasePrice = items.find(
        (item) => item.id === detail.itemId
      )?.basePrice;
      const purchasedPrice = supplierPrice ?? itemBasePrice ?? 0;

      if (
        applyRound(Number(purchasedPrice), roundFormat, precision) !==
        applyRound(Number(detail.purchasedPrice), roundFormat, precision)
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "VALUE_MISMATCH",
            `Purchased price mismatch: expected ${applyRound(
              Number(purchasedPrice),
              roundFormat,
              precision
            )}, got ${applyRound(
              Number(detail.purchasedPrice),
              roundFormat,
              precision
            )})`
          )
        );
      }
    } else {
      const itemData = items.find((item) => item.id === detail.itemId);
      if (!itemData?.isPriceVariable) {
        throw new ErrorHandler(
          400,
          `Cannot change the price of item: ${itemData?.item}`
        );
      }
    }
    const { purchasedPrice, quantity, totalAmount, itemId } = detail;

    const item = items.find((item) => item.id === itemId);

    const expectedTotal = calculatePurchaseOrderItemTotal({
      itemStockType,
      unitDefaultValue: item?.unit?.defaultValue ?? 1,
      purchasedPrice,
      quantity,
      calculationMethod,
      roundFormat,
      precision,
    });

    const roundedExpectedTotal = applyRound(
      expectedTotal,
      roundFormat,
      precision
    );
    const roundedProvidedTotal = applyRound(
      Number(totalAmount),
      roundFormat,
      precision
    );

    if (roundedExpectedTotal !== roundedProvidedTotal) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item total mismatch for item ${itemId}: expected ${roundedExpectedTotal}, got ${roundedProvidedTotal}`
        )
      );
    }

    sumOfProductsTotal += roundedExpectedTotal;
  }

  const roundedSumOfProductsTotal = applyRound(
    sumOfProductsTotal,
    roundFormat,
    precision
  );
  const roundedGrandTotal = applyRound(
    Number(body.grandTotal),
    roundFormat,
    precision
  );

  if (roundedSumOfProductsTotal !== roundedGrandTotal) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Grand total mismatch: expected ${roundedSumOfProductsTotal}, got ${roundedGrandTotal}`
      )
    );
  }

  logger.info("exiting::validatePurchaseOrderCommon::service::validation");
};

export const createPOServiceValidation = async (
  body: CreatePurchaseOrderInput
) => {
  logger.info("entering::createPOServiceValidation::service::validation");

  await validatePurchaseOrderCommon(body);

  logger.info("exiting::createPOServiceValidation::service::validation");
};

export const updatePOServiceValidation = async (body: UpdatePurchaseOrder) => {
  logger.info("entering::updatePOServiceValidation::service::validation");

  if (body.id == null) {
    logger.error("missing PurchaseOrder id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "PurchaseOrder id")
    );
  }
  logger.info(`validating existence of PurchaseOrder id=${body.id}`);
  const existingPO = await validateIdPO(body.id);
  body.po = existingPO;

  const updatedIds: number[] = body.purchaseOrderDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in stock transfer details
  const existingIds = existingPO.purchaseOrderDetails.map((item) => item.id);
  // check if any item is not in stock transfer details
  const notInPODetails = updatedIds.filter((id) => !existingIds.includes(id));
  if (notInPODetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", `of Purchase order Details`)
    );
  }

  if (
    existingPO.status !== PO_STATUS.DRAFT &&
    existingPO.status !== PO_STATUS.SENT_FOR_APPROVAL
  ) {
    logger.error(
      `cannot update PurchaseOrder id=${body.id} in status=${existingPO.status}`
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_STATUS",
        `Cannot update Purchase Order when status is ${existingPO.status}`
      )
    );
  }

  await validatePurchaseOrderCommon(body);

  logger.info("exiting::updatePOServiceValidation::service::validation");
};

export const deletePOServiceValidation = async (id: number) => {
  logger.info("entering::deletePOServiceValidation::service::validation");
  const po = await validateIdPO(id);
  if (
    po.status !== PO_STATUS.DRAFT &&
    po.status !== PO_STATUS.SENT_FOR_APPROVAL
  ) {
    logger.error(
      `Cannot delete Purchase Order with id=${id} in status=${po.status}`
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Purchase Order")
    );
  }

  logger.info("exiting::deletePOServiceValidation::service::validation");
};

export const updatePurchaseOrderStatusServiceValidation = async (
  id: number
) => {
  logger.info(
    "entering::updatePurchaseOrderStatusServiceValidation::service::validation"
  );
  const po = await validateIdPO(id);
  if (
    po.status === PO_STATUS.DRAFT ||
    po.status === PO_STATUS.APPROVED ||
    po.status === PO_STATUS.REJECTED
  ) {
    logger.error(
      `Cannot update Purchase Order status with id=${id} in status=${po.status}`
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Purchase Order")
    );
  }
  logger.info(
    "exiting::updatePurchaseOrderStatusServiceValidation::service::validation"
  );
};
