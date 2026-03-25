import { externalService } from "@repo/client/service/external.service.js";
import { TryCatch } from "@repo/platform";
import { printService } from "@/services/print/print.service.js";
import { sellService } from "@/services/sell/sell.service.js";
import {
  SellCoPaySetInput,
  sellExcelFilter,
  SellPaymentInput,
  SellStockAdjustmentInput,
} from "@/types/sell/sell.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
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

export const createSell = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createSell::controller");
  logger.info("Req Ip --------->" + JSON.stringify(req.ip));
  logger.info("Req Host --------->" + JSON.stringify(req.hostname));

  const input = req.body;
  const sell = await sellService.createSell(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Sell"),
    },
    sell,
  );
  logger.info("exiting::createSell::controller");
  return res.status(201).json(response);
});

export const getSellById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getSellById::controller");
  const { sellId, isAdjusted } = req.query as {
    sellId: string;
    isAdjusted: string;
  };
  const sell = await sellService.getSellById(
    Number(sellId),
    isAdjusted === "true",
  );
  if (!sell) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        message: generateErrorMessage("NOT_FOUND", "Sell"),
      }),
    );
  }
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Sell"),
    },
    sell,
  );
  logger.info("exiting::getSellById::controller");
  return res.status(200).json(response);
});

export const getAllSell = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllSell::controller");
  const sell = await sellService.getAllSell();
  if (!sell) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        message: generateErrorMessage("NOT_FOUND", "Sell"),
      }),
    );
  }
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Sell"),
    },
    sell,
  );
  logger.info("exiting::getAllSell::controller");
  return res.status(200).json(response);
});

export const updateSellStatus = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateSellStatus::controller");
    const input = req.body;
    const sell = await sellService.updateSellStatus(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Sell"),
      },
      sell,
    );
    logger.info("exiting::updateSellStatus::controller");
    return res.status(200).json(response);
  },
);

export const deleteSell = TryCatch(async (req, res) => {
  logger.info("entering::deleteSell::controller");
  const id = Number(req.query.sellId);

  await sellService.deleteSell(id);

  logger.info("exiting::deleteSell::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Sell "),
  });
});

export const excelSellReport = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::excelSellReport::controller");

  const input = req.body as sellExcelFilter;

  const wb: Workbook = await sellService.buildExcelJSWorkbookForSell(input);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="sell_report.xlsx"',
  );

  await wb.xlsx.write(res); // streams the Excel file
  res.end();
  logger.info("exiting::excelSellReport::controller");
});

export const getSellPdfById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getSellPdfById::controller");
  const { sellId } = req.query as { sellId: string };
  const sell = await sellService.getSellById(Number(sellId), true);
  if (!sell) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        message: generateErrorMessage("NOT_FOUND", "Sell"),
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
  const bodyTpl = path.join(tplDir, "sell-receipt.hbs");
  const base64Image = imageToBase64("public/images/logo.png");

  // Generate PDF buffer
  const pdfBuffer = await generatePDF(bodyTpl, {
    sell,
    base64Image,
    reportFor: "Sell Receipt",
    clinicName: sell.cc.colName,
    clinicAddress: sell.cc.address,
    clinicPhone: sell.cc.phone,
    clinicEmail: sell.cc.email,
  });

  // Set headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sell-receipt.pdf");

  // Send the PDF buffer directly to the client (binary stream)
  res.send(pdfBuffer); // This sends the buffer as binary content to the client

  logger.info("exiting::getSellPdfById::controller");
});

export const printReceiptBySellId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::printReceiptBySellId::controller");
    const { sellId } = req.query as { sellId: string };
    const sellDTO = await sellService.getSellByIdForReceipt(Number(sellId));
    if (!sellDTO) {
      throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Sell"));
    }

    const receipt = await printService.printSellReceipt(sellDTO);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("PRINTED", "Sell"),
      },
      receipt,
    );
    logger.info("exiting::printReceiptBySellId::controller");
    return res.status(200).json(response);
  },
);

export const adjustSellStock = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::adjustSellStock::controller");
  const input = req.body as SellStockAdjustmentInput;
  const isAdjusted = await sellService.sellStockAdjust(input);
  if (!isAdjusted) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        message: "Unable to adjust stock",
      }),
    );
  }
  const response = new BaseResponse({
    success: true,
    message: generateSuccessMessage("UPDATED", "Stock"),
  });
  logger.info("exiting::adjustSellStock::controller");
  return res.status(200).json(response);
});

export const takeSellPayment = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::takeSellPayment::controller");
  const input = req.body as SellPaymentInput;
  const data = await externalService.takeSellPayment(input);
  if (!data) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        message: "Failed to take payment",
      }),
    );
  }
  const response = new BaseResponse({
    success: data.status,
    message: data.message,
  });
  logger.info("exiting::takeSellPayment::controller");
  return res.status(200).json(response);
});
export const setSellCoPay = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::setSellCoPay::controller");
  const input = req.body as SellCoPaySetInput;
  const data = await externalService.setSellCoPay(input);
  if (!data) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        message: "Failed to set co-pay",
      }),
    );
  }
  const response = new BaseResponse({
    success: data.success,
    message: data.message,
  });
  logger.info("exiting::setSellCoPay::controller");
  return res.status(200).json(response);
});

export const getPaymentTransactions = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPaymentTransactions::controller");
    const { sellId } = req.query as { sellId: string };
    const paymentTransactions = await sellService.getPaymentTransactions(
      Number(sellId),
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Payment transaction"),
      },
      paymentTransactions,
    );
    logger.info("exiting::getPaymentTransactions::controller");
    return res.status(200).json(response);
  },
);

export const printNotCompletedMedReceiptByAptId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::printNotCompletedMedReceiptByAptId::controller");
    const { aptId } = req.query as { aptId: string };
    const printRes = await sellService.printNotCompletedSellReceipt(
      Number(aptId),
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("PRINTED", "Sell"),
      },
      printRes,
    );
    logger.info("exiting::printNotCompletedMedReceiptByAptId::controller");
    return res.status(200).json(response);
  },
);
