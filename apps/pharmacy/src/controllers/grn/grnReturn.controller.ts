import { TryCatch } from "@repo/platform";
import { grnReturnService } from "@/services/grn/grnReturn.service.js";
import {
  CreateGrnReturnInput,
  GrnReturnReqExcelFilter,
} from "@/types/grn/grnReturn.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import path from "path";

export const createGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createGrnReturn::controller");
  const input = req.body;
  const grnReturn = await grnReturnService.createGrnReturn(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Good Receive Note Return"),
    },
    grnReturn,
  );
  logger.info("exiting::createGrnReturn::controller");
  return res.status(201).json(response);
});

export const updateGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateGrnReturn::controller");

  const input = req.body as CreateGrnReturnInput;

  const updated = await grnReturnService.updateGrnReturn(input);

  logger.info("exiting::updateGrnReturn::controller");

  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Good Receive Note Return"),
      },
      updated,
    ),
  );
});

export const getAllGrnReturn = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllGrnReturn::controller");
  const grnReturn = await grnReturnService.getAllGrnReturn();
  logger.info("exiting::getAllGrnReturn::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Good Receive Note Return"),
      },
      grnReturn,
    ),
  );
});

export const getGrnReturnById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getGrnReturnById::controller");
    const { grnReturnId } = req.query as { grnReturnId: string };

    const grnReturn = await grnReturnService.getGrnReturnById(
      Number(grnReturnId),
    );

    if (!grnReturn) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "GRN Return not found",
        }),
      );
    }
    logger.info("exiting::getGrnReturnById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage(
            "FETCHED",
            "Good Receive Note Return",
          ),
        },
        grnReturn,
      ),
    );
  },
);

export const deleteGrnReturn = TryCatch(async (req, res) => {
  logger.info("entering::deleteGrnReturn::controller");
  const id = Number(req.query.grnReturnId);

  await grnReturnService.deleteGrnReturn(id);

  logger.info("exiting::deleteGrnReturn::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Good Receive Note Return"),
  });
});

export const approveGrnReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveGrnReturn::controller");
    const input = req.body;
    const grnReturn = await grnReturnService.approveGrnReturn(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("APPROVED", "Good Receive Note Return"),
      },
      grnReturn,
    );
    logger.info("exiting::approveGrnReturn::controller");
    return res.status(201).json(response);
  },
);

export const rejectedGrnReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::rejectedGrnReturn::controller");
    const input = req.body;
    const grnReturn = await grnReturnService.rejectedGrnReturn(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("REJECTED", "Good Receive Note Return"),
      },
      grnReturn,
    );
    logger.info("exiting::rejectedGrnReturn::controller");
    return res.status(200).json(response);
  },
);

export const excelGrnReturnReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelGrnReturnReport::controller");
    const input = req.body as GrnReturnReqExcelFilter;

    const wb: Workbook =
      await grnReturnService.buildExcelJSWorkbookForGrnReturnByFilter(input);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="grn_return_report.xlsx"`,
    );
    await wb.xlsx.write(res);
    logger.info("exiting::excelGrnReturnReport::controller");
    res.end();
  },
);

export const printGrnReturnById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::printGrnReturnById::controller");

    // 1) Read filters and fetch data
    const { id } = req.query as { id: string };

    const grnReturn = await grnReturnService.getGrnReturnById(Number(id));

    // 3) Locate template & logo
    const tplDir = path.join(
      process.cwd(),
      "src",
      "templates",
      "pdf",
      "reports-pdf",
      "grn",
    );
    const bodyTpl = path.join(tplDir, "grnReturn.hbs");
    const base64Image = imageToBase64("public/images/logo.png");

    // 4) Render PDF
    const pdfBuffer = await generatePDF(bodyTpl, {
      grnReturn,
      base64Image,
      reportFor: "Good Receive Return",
      clinicName: grnReturn?.warehouse?.name,
      clinicAddress: grnReturn?.warehouse?.address,
      clinicPhone: grnReturn?.warehouse?.phone,
      clinicEmail: grnReturn?.warehouse?.email,
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
  },
);
