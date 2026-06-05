import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { grnService } from "@/services/grn/grn.service.js";
import { CreateGrnInput } from "@/types/grn/grn.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import path from "path";
import { settingsService } from "@/services/master/settings.service.js";
import { RoundFormat } from "av6-utils";
import { generatePDF } from "@/utils/pdfGenerator.utils.js";
import { applyGrnRateReverseConversion } from "@/utils/rateConversation.utils.js";

export const createGrn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createGrn::controller");
  const input = req.body;
  const grn = await grnService.createGrn(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: grn },
    "Good Receive Note"
  );
  logger.info("exiting::createGrn::controller");
  return res.status(201).json(response);
});

export const updateGrn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateGrn::controller");

  const input = req.body as CreateGrnInput;

  const updated = await grnService.updateGrn(input);

  logger.info("exiting::updateGrn::controller");

  return res
    .status(200)
    .json(
      BaseResponse.success(
        { type: "UPDATED", data: updated },
        "Good Receive Note"
      )
    );
});

export const getAllGrn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllGrn::controller");
  const grn = await grnService.getAllGrn();
  logger.info("exiting::getAllGrn::controller");
  return res
    .status(200)
    .json(
      BaseResponse.success({ type: "FETCHED", data: grn }, "Good Receive Note")
    );
});

export const getGrnById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getGrnById::controller");
  const { grnId } = req.query as { grnId: string };

  const grn = await grnService.getGrnById(Number(grnId));

  if (!grn) {
    return res.status(404).json(
      BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Good Receive Note"),
      })
    );
  }

  logger.info("exiting::getGrnById::controller");
  return res
    .status(200)
    .json(
      BaseResponse.success({ type: "FETCHED", data: grn }, "Good Receive Note")
    );
});

export const deleteGrn = TryCatch(async (req, res) => {
  logger.info("entering::deleteGrn::controller");
  const id = Number(req.query.grnId);

  await grnService.deleteGrn(id);

  logger.info("exiting::deleteGrn::controller");
  return res
    .status(200)
    .json(BaseResponse.success({ type: "DELETED" }, "Good Receive Note"));
});

// export const excelGrnReport = TryCatch(async (req: Request, res: Response) => {
//   const input = req.body as GrnReqExcelFilter;

//   const wb: Workbook = await grnService.buildExcelJSWorkbookForGrnByFilter(input);
//   res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//   res.setHeader("Content-Disposition", `attachment; filename="grn_report.xlsx"`);
//   await wb.xlsx.write(res);
//   res.end();
// });

export const printGrnById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::printGrnById::controller");

  const settings = await settingsService.getSettings();
  const roundFormat: RoundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision: number = settings?.defaultPrecision || 2;
  // 1) Read filters and fetch data
  const { grnId } = req.query as { grnId: string };

  const grn = await grnService.getGrnById(Number(grnId));
  if (!grn) {
    return res.status(404).json(
      BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Good Receive Note"),
      })
    );
  }
  const convertedGrn = applyGrnRateReverseConversion(grn, {
    roundFormat,
    precision,
  });
  // 3) Locate template & logo
  const tplDir = path.join(
    process.cwd(),
    "src",
    "templates",
    "pdf",
    "reports-pdf",
    "grn"
  );
  const bodyTpl = path.join(tplDir, "grn.hbs");
  const base64Image = imageToBase64("public/images/logo.png");

  // 4) Render PDF
  const pdfBuffer = await generatePDF(bodyTpl, {
    grn: convertedGrn,
    base64Image,
    reportFor: "Good Receive Note",
  });

  // 5) Stream down
  res
    .status(200)
    .set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="good_receive.pdf"',
    })
    .send(pdfBuffer);

  logger.info("exiting::printGrnById::controller");
});
