import { TryCatch } from "@repo/platform";
import { gatePassService } from "@/services/gatePass/gatePass.service.js";
import {
  CreateOrUpdateGatePassInput,
  GatePassFilter,
} from "@/types/gatePass/gatePass.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import path from "path";

export const createGatePass = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createGatePass::controller");
  const input = req.body;
  const gatePass = await gatePassService.createGatePass(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Gate Pass"),
    },
    gatePass,
  );
  logger.info("exiting::createGatePass::controller");
  return res.status(201).json(response);
});

export const updateGatePass = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateGatePass::controller");

  const input = req.body as CreateOrUpdateGatePassInput;

  const updated = await gatePassService.updateGatePass(input);

  logger.info("exiting::updateGatePass::controller");

  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Gate Pass"),
      },
      updated,
    ),
  );
});

export const getAllGatePass = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllGatePass::controller");
  const cities = await gatePassService.getAllGatePass();
  logger.info("exiting::getAllGatePass::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Gate Pass"),
      },
      cities,
    ),
  );
});

export const getGatePassById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getGatePassById::controller");
  const { gatePassId } = req.query as { gatePassId: string };

  const gatePass = await gatePassService.getGatePassById(Number(gatePassId));

  if (!gatePass) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getGatePassById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Gate Pass"),
      },
      gatePass,
    ),
  );
});

export const deleteGatePass = TryCatch(async (req, res) => {
  logger.info("entering::deleteGatePass::controller");
  const id = Number(req.query.gatePassId);

  await gatePassService.deleteGatePass(id);

  logger.info("exiting::deleteGatePass::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Gate Pass"),
  });
});

export const getGatePassPdfById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getGatePassPdfById::controller");
    const { gatePassId } = req.query as { gatePassId: string };
    const gatePass = await gatePassService.getGatePassById(
      Number(gatePassId),
      false,
    );
    if (!gatePass) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Gate Pass"),
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
    const bodyTpl = path.join(tplDir, "gate-pass.hbs");
    const base64Image = imageToBase64("public/images/logo.png");

    // Generate PDF buffer
    const pdfBuffer = await generatePDF(bodyTpl, {
      gatePass,
      base64Image,
      reportFor: "Gate Pass",
      format: "A5",
      landscape: true,
      clinicName: gatePass.warehouse?.name,
      clinicAddress: gatePass.warehouse?.address,
      clinicPhone: gatePass.warehouse?.phone,
      clinicEmail: gatePass.warehouse?.email,
    });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=gate-pass.pdf");

    // Send the PDF buffer directly to the client (binary stream)
    res.send(pdfBuffer); // This sends the buffer as binary content to the client

    logger.info("exiting::getGatePassPdfById::controller");
  },
);

export const excelGatePassReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelGatePassReport::controller");
    const filter = req.body as GatePassFilter;
    const wb: Workbook =
      await gatePassService.buildGatePassReportWorkbook(filter);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gate_pass_report.xlsx"`,
    );
    await wb.xlsx.write(res);
    res.end();
  },
);
