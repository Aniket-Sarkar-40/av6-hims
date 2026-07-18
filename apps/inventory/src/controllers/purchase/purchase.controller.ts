import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { purchaseService } from "@/services/purchase/purchase.service.js";
import { UpdatePurchaseOrder } from "@/types/purchase/purchase.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import path from "node:path";
import { PO_STATUS } from "@repo/db/generated/prisma/enums.js";

export const createPurchase = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createPurchase::controller");
  const input = req.body;
  const purchase = await purchaseService.createPurchaseOrder(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: purchase },
    "Purchase Order",
  );
  logger.info("exiting::createPurchase::controller");
  return res.status(201).json(response);
});

export const updatePurchase = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updatePurchase::controller");

  const input = req.body as UpdatePurchaseOrder;
  const updated = await purchaseService.updatePurchase(input);

  logger.info("exiting::updatePurchase::controller");
  const response = BaseResponse.success(
    { type: "UPDATED", data: updated },
    "Purchase Order",
  );
  return res.status(200).json(response);
});

export const getAllPurchase = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllPurchase::controller");
  const purchase = await purchaseService.getAllPurchase();
  logger.info("exiting::getAllPurchase::controller");

  const response = BaseResponse.success(
    { type: "FETCHED", data: purchase },
    "Purchase Order",
  );
  return res.status(200).json(response);
});

export const getPurchaseById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getPurchaseById::controller");
  const { purchaseId } = req.query as { purchaseId: string };

  const purchase = await purchaseService.getPurchaseById(Number(purchaseId));

  if (!purchase) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  const response = BaseResponse.success(
    { type: "FETCHED", data: purchase },
    "Purchase Order",
  );
  logger.info("exiting::getPurchaseById::controller");
  return res.status(200).json(response);
});

export const deletePurchase = TryCatch(async (req, res) => {
  logger.info("entering::deletePurchase::controller");
  const id = Number(req.query.purchaseId);

  await purchaseService.deletePurchase(id);

  logger.info("exiting::deletePurchase::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Purchase Order"),
  });
});

export const purchaseApproval = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::purchaseApproval::controller");

    const purchaseId = Number(req.body.subjectId);

    const approvalPo = await purchaseService.updatePurchaseOrderStatus(
      purchaseId,
      PO_STATUS.APPROVED,
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("APPROVED", "Purchase Order"),
      },
      approvalPo,
    );

    logger.info("exiting::purchaseApproval::controller");
    return res.status(200).json(response);
  },
);

export const purchasePartialApproval = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::purchaseApproval::controller");

    const purchaseId = Number(req.body.subjectId);

    const approvalPo = await purchaseService.updatePurchaseOrderStatus(
      purchaseId,
      PO_STATUS.PARTIALLY_APPROVED,
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("APPROVED", "Purchase Order"),
      },
      approvalPo,
    );

    logger.info("exiting::purchasePartialApproval::controller");
    return res.status(200).json(response);
  },
);

export const purchaseRejection = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::purchaseRejection::controller");

    const purchaseId = Number(req.body.subjectId);

    const approvalPo = await purchaseService.updatePurchaseOrderStatus(
      purchaseId,
      PO_STATUS.REJECTED,
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("REJECTED", "Purchase Order"),
      },
      approvalPo,
    );

    logger.info("exiting::purchaseRejection::controller");
    return res.status(200).json(response);
  },
);

export const generatePurchaseOrderPdf = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::generatePayrollPdf::controller");
    const input = req.query.id as string;
    const pdfBuffer = await purchaseService.generatePoPdf(Number(input));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="purchase-order-${input}.pdf"`,
    );
    res.send(pdfBuffer);
    logger.info("exiting::generatePurchaseOrderPdf::controller");
  },
);
