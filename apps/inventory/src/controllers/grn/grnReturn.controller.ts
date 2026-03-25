import { TryCatch } from "@/middlewares/error.middleware";
import { grnReturnService } from "@/services/grn/grnReturn.service";
import { CreateGrnReturnInput } from "@/types/grn/grnReturn";

import { BaseResponse } from "@/utils/baseResponse.utils";
import { imageToBase64 } from "@/utils/helper.utils";
import { logger } from "@/utils/logger.utils";
import { generatePDF } from "@/utils/pdfGenerator.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { Request, Response } from "express";
import path from "path";

export const createGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createGrnReturn::controller");
  const input = req.body;
  const grnReturn = await grnReturnService.createGrnReturn(input);
  const response = BaseResponse.success({ type: "CREATED", data: grnReturn }, "Good Received");

  logger.info("exiting::createGrnReturn::controller");
  return res.status(201).json(response);
});

export const updateGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateGrnReturn::controller");

  const input = req.body as CreateGrnReturnInput;

  const updated = await grnReturnService.updateGrnReturn(input);

  logger.info("exiting::updateGrnReturn::controller");

  const response = BaseResponse.success({ type: "UPDATED", data: updated }, "Good Received");
  return res.status(200).json(response);
});

export const getAllGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllGrnReturn::controller");
  const grnReturn = await grnReturnService.getAllGrnReturn();
  logger.info("exiting::getAllGrnReturn::controller");
  const response = BaseResponse.success({ type: "CREATED", data: grnReturn }, "Good Received");
  return res.status(200).json(response);
});

export const getGrnReturnById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getGrnReturnById::controller");
  const { grnReturnId } = req.query as { grnReturnId: string };

  const grnReturn = await grnReturnService.getGrnReturnById(Number(grnReturnId));

  if (!grnReturn) {
    const errRes = BaseResponse.error({ message: generateErrorMessage("NOT_FOUND", "Good Received") });
    return res.status(400).json(errRes);
  }
  logger.info("exiting::getGrnReturnById::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: grnReturn }, "Good Received");
  return res.status(200).json(response);
});

export const deleteGrnReturn = TryCatch(async (req, res) => {
  logger.info("entering::deleteGrnReturn::controller");
  const id = Number(req.query.grnReturnId);

  const del = await grnReturnService.deleteGrnReturn(id);

  logger.info("exiting::deleteGrnReturn::controller");
  const response = BaseResponse.success({ type: "DELETED", data: del }, "Good Received");
  return res.status(200).json(response);
});

export const approveGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::approveGrnReturn::controller");
  const input = req.body;
  const grnReturn = await grnReturnService.approveGrnReturn(input);
  const response = BaseResponse.success({ type: "APPROVED", data: grnReturn }, "Good Received");
  logger.info("exiting::approveGrnReturn::controller");
  return res.status(201).json(response);
});

export const rejectedGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::rejectedGrnReturn::controller");
  const input = req.body;
  const grnReturn = await grnReturnService.rejectedGrnReturn(input);
  const response = BaseResponse.success({ type: "REJECTED", data: grnReturn }, "Good Received");
  logger.info("exiting::rejectedGrnReturn::controller");
  return res.status(200).json(response);
});

// export const excelGrnReturnReport = TryCatch(async (req: Request, res: Response) => {
//   logger.info("entering::excelGrnReturnReport::controller");
//   const input = req.body as GrnReturnReqExcelFilter;

//   const wb: Workbook = await grnReturnService.buildExcelJSWorkbookForGrnReturnByFilter(input);
//   res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//   res.setHeader("Content-Disposition", `attachment; filename="grn_return_report.xlsx"`);
//   await wb.xlsx.write(res);
//   logger.info("exiting::excelGrnReturnReport::controller");
//   res.end();
// });

export const printGrnReturnById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::printGrnReturnById::controller");

  // 1) Read filters and fetch data
  const { id } = req.query as { id: string };

  const grnReturn = await grnReturnService.getGrnReturnById(Number(id));

  // 3) Locate template & logo
  const tplDir = path.join(process.cwd(), "src", "templates", "pdf", "reports-pdf", "grn");
  const bodyTpl = path.join(tplDir, "grnReturn.hbs");
  const base64Image = imageToBase64("public/images/logo.png");

  // 4) Render PDF
  const pdfBuffer = await generatePDF(bodyTpl, {
    grnReturn,
    base64Image,
    reportFor: "Good Receive Return",
  });

  // 5) Stream down
  res
    .status(200)
    .set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="good_receive_return.pdf"',
    })
    .send(pdfBuffer);

  logger.info("exiting::printGrnReturnById::controller");
});
