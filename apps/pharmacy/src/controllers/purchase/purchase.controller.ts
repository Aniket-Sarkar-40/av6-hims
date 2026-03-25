import { TryCatch } from "@repo/platform";
import { purchaseService } from "@/services/purchase/purchase.service.js";
import {
  CreatePurchaseOrderInput,
  PurchaseReqExcelFilter,
} from "@/types/purchase/purchase.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generatePDF } from "@repo/shared/utils/pdfGenerator.utils.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import path from "path";

export const createPurchase = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createPurchase::controller");
  const input = req.body;
  const purchase = await purchaseService.createPurchaseOrder(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Purchase Order"),
    },
    purchase,
  );
  logger.info("exiting::createPurchase::controller");
  return res.status(201).json(response);
});

export const updatePurchase = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updatePurchase::controller");

  const input = req.body as CreatePurchaseOrderInput;

  const updated = await purchaseService.updatePurchase(input);

  logger.info("exiting::updatePurchase::controller");

  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Purchase Order"),
      },
      updated,
    ),
  );
});

export const getAllPurchase = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllPurchase::controller");
  const cities = await purchaseService.getAllPurchase();
  logger.info("exiting::getAllPurchase::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Purchase Order"),
      },
      cities,
    ),
  );
});

export const getPurchaseById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getPurchaseById::controller");
  const { purchaseId } = req.query as { purchaseId: string };

  const purchaseOrder = await purchaseService.getPurchaseById(
    Number(purchaseId),
  );

  if (!purchaseOrder) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getPurchaseById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Purchase Order"),
      },
      purchaseOrder,
    ),
  );
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

    const purchaseId = Number(req.params.id);

    const approvalPo = await purchaseService.purchaseApproval(purchaseId);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "UPDATED",
          "Purchase Order Verification",
        ),
      },
      approvalPo,
    );

    logger.info("exiting::purchaseApproval::controller");
    return res.status(200).json(response);
  },
);

export const excelPurchaseOrderReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelPurchaseOrderReport::controller");
    const input = req.body as PurchaseReqExcelFilter;

    const wb: Workbook =
      await purchaseService.buildExcelJSWorkbookForPurchaseOrderByFilter(input);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="purchase_order_report.xlsx"`,
    );
    await wb.xlsx.write(res);
    logger.info("exiting::excelPurchaseOrderReport::controller");
    res.end();
  },
);

export const printPOById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::printPOById::controller");

  // 1) Read filters and fetch data
  const { id } = req.query as { id: string };

  const po = await purchaseService.getPurchaseById(Number(id));

  // 3) Locate template & logo
  const tplDir = path.join(
    process.cwd(),
    "src",
    "templates",
    "pdf",
    "reports-pdf",
    "purchase",
  );
  const bodyTpl = path.join(tplDir, "purchase.hbs");
  const base64Image = imageToBase64("public/images/logo.png");

  // 4) Render PDF
  const pdfBuffer = await generatePDF(bodyTpl, {
    po,
    base64Image,
    reportFor: "Purchase Order",
    clinicName: po?.warehouse?.collectionCenter?.colName,
    clinicAddress: po?.warehouse?.collectionCenter?.address,
    clinicPhone: po?.warehouse?.collectionCenter?.phone,
    clinicEmail: po?.warehouse?.collectionCenter?.email,
  });

  // 5) Stream down
  res
    .status(200)
    .set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="purchase_order.pdf"',
    })
    .send(pdfBuffer);

  logger.info("exiting::printPOById::controller");
});
