import { TryCatch } from "@repo/platform";
import { sellReturnService } from "@/services/sell/sellReturn.service.js";
import {
  SellReturnExcelFilter,
  SellReturnInput,
} from "@/types/sell/sellReturn.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generatePDF } from "@repo/shared/utils/pdfGenerator.utils.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import path from "path";

export const createSellReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createSellReturn::controller");
    const input = req.body;
    const grn = await sellReturnService.createSellReturn(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Sell Return"),
      },
      grn,
    );
    logger.info("exiting::createSellReturn::controller");
    return res.status(201).json(response);
  },
);

export const updateSellReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateSellReturn::controller");

    const input = req.body as SellReturnInput;

    const updated = await sellReturnService.updateSellReturn(input);

    logger.info("exiting::updateSellReturn::controller");

    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Sell Return"),
        },
        updated,
      ),
    );
  },
);

export const deleteSellReturn = TryCatch(async (req, res) => {
  logger.info("entering::deleteSellReturn::controller");
  const id = Number(req.query.sellReturnId);

  await sellReturnService.deleteSellReturn(id);

  logger.info("exiting::deleteSellReturn::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Sell Return"),
  });
});

export const approveSellReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveSellReturn::controller");
    const input = req.body;
    const grnReturn = await sellReturnService.approveSellReturn(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("APPROVED", "Sell Return"),
      },
      grnReturn,
    );
    logger.info("exiting::approveSellReturn::controller");
    return res.status(201).json(response);
  },
);

export const rejectedSellReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::rejectedSellReturn::controller");
    const input = req.body;
    const grnReturn = await sellReturnService.rejectedSellReturn(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("REJECTED", "Sell Return"),
      },
      grnReturn,
    );
    logger.info("exiting::rejectedSellReturn::controller");
    return res.status(200).json(response);
  },
);

export const getSellReturnById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getSellReturnById::controller");
    const { sellReturnId } = req.query as { sellReturnId: string };
    const sell = await sellReturnService.getSellReturnById(
      Number(sellReturnId),
    );
    if (!sell) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Sell Return"),
        }),
      );
    }
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Sell Return"),
      },
      sell,
    );
    logger.info("exiting::getSellReturnById::controller");
    return res.status(200).json(response);
  },
);

export const getAllSellReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllSellReturn::controller");
    const sell = await sellReturnService.getAllSellReturn();
    if (!sell) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Sell Return"),
        }),
      );
    }
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Sell Return"),
      },
      sell,
    );
    logger.info("exiting::getAllSellReturn::controller");
    return res.status(200).json(response);
  },
);

export const excelSellReturnReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelSellReturnReport::controller");

    const input = req.body as SellReturnExcelFilter;

    const wb: Workbook =
      await sellReturnService.buildExcelJSWorkbookForSellReturn(input);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sell_Return_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
    logger.info("exiting::excelSellReturnReport::controller");
  },
);

export const getSellReturnPdfById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getSellReturnPdfById::controller");
    const { sellReturnId } = req.query as { sellReturnId: string };
    const sellReturn = await sellReturnService.getSellReturnById(
      Number(sellReturnId),
    );
    if (!sellReturn) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Sell Return"),
        }),
      );
    }
    const tplDir = path.join(
      process.cwd(),
      "src",
      "templates",
      "pdf",
      "reports-pdf",
    );

    //Body Template
    const bodyTpl = path.join(tplDir, "sell-return-receipt.hbs");
    const base64Image = imageToBase64("public/images/logo.png");

    // Generate PDF buffer
    const pdfBuffer = await generatePDF(bodyTpl, {
      sellReturn,
      base64Image,
      reportFor: "Sell Return Receipt",
      clinicName: sellReturn.cc.colName,
      clinicAddress: sellReturn.cc.address,
      clinicPhone: sellReturn.cc.phone,
      clinicEmail: sellReturn.cc.email,
    });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sell-return-receipt.pdf",
    );

    // Send the PDF buffer directly to the client (binary stream)
    res.send(pdfBuffer); // This sends the buffer as binary content to the client

    logger.info("exiting::getSellReturnPdfById::controller");
  },
);
