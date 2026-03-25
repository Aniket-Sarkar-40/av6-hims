import {
  findGatePassByInvoiceNumber,
  getGatePassByIdFromDb,
} from "@/repository/gatePass/gatePass.repository.js";
import { getPOByNumberFromDb } from "@/repository/purchase/purchase.repository.js";
import { CreateOrUpdateGatePassInput } from "@/types/gatePass/gatePass.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdDistributor } from "../distributor/distributor.service.validation.js";
import { validateWarehouseId } from "../master/warehouse.service.validation.js";
import dayjs from "dayjs";

export const validateIdGatePass = async (id: number) => {
  logger.info("entering::validateIdGatePass service::validation");
  validIdCheck(id);
  const gatePass = await getGatePassByIdFromDb(id);
  if (!gatePass) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Gate Pass"));
  }
  logger.info("exiting::validateIdGatePass::service::validation");

  return gatePass;
};

export const validateGatePassCommon = async (
  body: CreateOrUpdateGatePassInput,
) => {
  logger.info("entering::validateGatePassCommon::service::validation");
  await validateIdDistributor(body.distributorId);
  await validateWarehouseId(body.warehouseId);

  const po = await getPOByNumberFromDb(body.poNumber);
  if (!po) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Purchase Order Number"),
    );
  }
  const remainingQty = po.purchaseOrderDetails.reduce(
    (sum, d) => sum + (d.quantity - (d.receivedQty ?? 0)),
    0,
  );

  if (body.totalQuantity > remainingQty) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Total Quantity"),
    );
  }

  if (body.billAmount > Number(po.grandTotal)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Bill Amount"),
    );
  }

  if (!(po.status === "PARTIALLY_RECEIVED" || po.status === "APPROVED")) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Purchase Order "),
    );
  }
  if (
    dayjs(po.date).format("YYYY-MM-DD") !==
    dayjs(body.poDate).format("YYYY-MM-DD")
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        "Purchase Order Date",
        "Gate Pass PO Date",
      ),
    );
  }
  return po;
};

export const createGatePassServiceValidation = async (
  body: CreateOrUpdateGatePassInput,
) => {
  logger.info("entering::createGatePassServiceValidation::service::validation");

  await validateGatePassCommon(body);

  if (body.invoiceNumber) {
    const existing = await findGatePassByInvoiceNumber(body.invoiceNumber);
    if (existing) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Invoice Number"),
      );
    }
  }

  logger.info("exiting::createGatePassServiceValidation::service::validation");
};

export const updateGatePassServiceValidation = async (
  body: CreateOrUpdateGatePassInput,
) => {
  logger.info("entering::updateGatePassServiceValidation::service::validation");

  if (body.id == null) {
    logger.error("missing gatePass id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Gate Pass Number id"),
    );
  }
  logger.info(`validating existence of gatePass id=${body.id}`);
  await validateIdGatePass(body.id);

  await validateGatePassCommon(body);

  if (body.invoiceNumber) {
    const existing = await findGatePassByInvoiceNumber(body.invoiceNumber);
    if (existing && existing.poNumber !== body.poNumber) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Invoice Number"),
      );
    }
  }

  logger.info("exiting::updateGatePassServiceValidation::service::validation");
};
