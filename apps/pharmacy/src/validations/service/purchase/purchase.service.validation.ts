import { getCountItemsFromDb } from "@/repository/item/item.repository.js";
import { getCountMedCategoriesFromDb } from "@/repository/master/medCategory.repository.js";
import { getPOByIdFromDb } from "@/repository/purchase/purchase.repository.js";
import { CreatePurchaseOrderInput } from "@/types/purchase/purchase.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { CalculationMethod, PO_STATUS } from "@repo/db/generated/prisma/client";
import { validateIdDistributor } from "../distributor/distributor.service.validation.js";
import { validateIdStorage } from "../master/storage.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { settingsService } from "@/services/master/settings.service.js";
import { applyRound } from "av6-utils";

export const validateIdPO = async (id: number) => {
  logger.info("entering::validateIdPO service::validation");
  validIdCheck(id);
  const po = await getPOByIdFromDb(id);
  if (!po) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Purchase Order"),
    );
  }
  logger.info("exiting::validateIdPO::service::validation");

  return po;
};

export const validatePurchaseOrderCommon = async (
  body: CreatePurchaseOrderInput,
): Promise<void> => {
  logger.info("entering::validatePurchaseOrderCommon::service::validation");

  if (body.status && !["DRAFT", "SENT_FOR_APPROVAL"].includes(body.status)) {
    logger.error(`invalid Purchase Order status=${body.status}`);
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Purchase Order"),
    );
  }

  const distributor = await validateIdDistributor(body.distributorId);
  body.distributor = distributor;
  const warehouse = await validateWarehouseId(body.warehouseId);
  body.warehouse = warehouse;
  if (body.storageId != null) {
    await validateIdStorage(body.storageId);
  }
  const settings = await settingsService.getSettings();
  const calculationMethod: CalculationMethod =
    settings?.poCalculationMethod || "STEP_WISE";
  const precision = settings?.poPrecision || 5;

  const itemIds = [...new Set(body.purchaseOrderDetails.map((d) => d.itemId))];
  const categoryIds = [
    ...new Set(
      body.purchaseOrderDetails
        .map((d) => d.itemCategoryId)
        .filter((id): id is number => id != null),
    ),
  ];

  const [items, categories] = await Promise.all([
    getCountItemsFromDb(itemIds),
    getCountMedCategoriesFromDb(categoryIds),
  ]);

  if (items.length !== itemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }

  if (categoryIds.length > 0 && categories.length !== categoryIds.length) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Category"),
    );
  }
  // const EPSILON = 0.01;
  // const almostEqual = (a: number, b: number) => Math.abs(a - b) <= EPSILON;

  let sumOfProductsTotal = 0;
  for (const detail of body.purchaseOrderDetails) {
    const { purchasedPrice, quantity, totalAmount, itemId } = detail;
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Item with id ${itemId}`),
      );
    }

    const medicineName = item.medicineName;

    let expectedTotal = purchasedPrice * quantity;
    expectedTotal =
      calculationMethod === "STEP_WISE"
        ? applyRound(expectedTotal, "TO_FIXED", precision)
        : expectedTotal;
    if (applyRound(expectedTotal, "TO_FIXED", precision) !== totalAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Item total mismatch for item ${medicineName}: expected ${applyRound(expectedTotal, "TO_FIXED", precision)}, got ${totalAmount}`,
        ),
      );
    }

    sumOfProductsTotal += totalAmount;
  }

  logger.info(
    `calculated sum of item totals: ${applyRound(sumOfProductsTotal, "TO_FIXED", precision)}`,
  );
  logger.info(
    `comparing sumOfProductsTotal to provided grandTotal=${body.grandTotal}`,
  );

  if (
    applyRound(sumOfProductsTotal, "TO_FIXED", precision) !== body.grandTotal
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Grand total mismatch: expected ${applyRound(sumOfProductsTotal, "TO_FIXED", precision)}, got ${body.grandTotal}`,
      ),
    );
  }

  logger.info("exiting::validatePurchaseOrderCommon::service::validation");
};

export const createPOServiceValidation = async (
  body: CreatePurchaseOrderInput,
) => {
  logger.info("entering::createPOServiceValidation::service::validation");

  await validatePurchaseOrderCommon(body);

  logger.info("exiting::createPOServiceValidation::service::validation");
};

export const updatePOServiceValidation = async (
  body: CreatePurchaseOrderInput,
) => {
  logger.info("entering::updatePOServiceValidation::service::validation");

  if (body.id == null) {
    logger.error("missing PurchaseOrder id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "PurchaseOrder id"),
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
      generateErrorMessage(
        "INVALID_FIELD",
        `Id ${notInPODetails.join(", ")} of Purchase order Details`,
      ),
    );
  }

  if (
    existingPO.status !== PO_STATUS.DRAFT &&
    existingPO.status !== PO_STATUS.SENT_FOR_APPROVAL
  ) {
    logger.error(
      `cannot update PurchaseOrder id=${body.id} in status=${existingPO.status}`,
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_STATUS",
        `Cannot update Purchase Order when status is ${existingPO.status}`,
      ),
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
      `Cannot delete Purchase Order with id=${id} in status=${po.status}`,
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Purchase Order"),
    );
  }

  logger.info("exiting::deletePOServiceValidation::service::validation");
};
