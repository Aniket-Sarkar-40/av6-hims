import { TryCatch } from "@repo/platform";
import { storeRequisitionService } from "@/services/purchase/storeRequisition.service.js";
import {
  AcknowledgeRequisition,
  ApproveStoreReqInput,
  CreateStoreRequisitionInput,
  RejectStoreRequisitionInput,
  StoreReqExcelFilter,
} from "@/types/purchase/storeRequisition.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { imageToBase64 } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
// import { generatePDF } from "@repo/shared/utils/pdfGenerator.utils.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import path from "path";

export const createStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStoreRequisition::controller");
    const input = req.body;
    const storeRequisition =
      await storeRequisitionService.createStoreRequisition(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Store Requisition"),
      },
      storeRequisition,
    );
    logger.info("exiting::createStoreRequisition::controller");
    return res.status(201).json(response);
  },
);

export const updateStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateStoreRequisition::controller");

    const input = req.body as CreateStoreRequisitionInput;

    const updated = await storeRequisitionService.updateStoreRequisition(input);

    logger.info("exiting::updateStoreRequisition::controller");

    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Store Requisition"),
        },
        updated,
      ),
    );
  },
);

export const getAllStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStoreRequisition::controller");
    const cities = await storeRequisitionService.getAllStoreRequisition();
    logger.info("exiting::getAllStoreRequisition::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Store Requisition"),
        },
        cities,
      ),
    );
  },
);

export const getstoreRequisitionById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getstoreRequisitionById::controller");
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const storeRequisition =
      await storeRequisitionService.getStoreRequisitionById(
        Number(storeRequisitionId),
      );

    if (!storeRequisition) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getstoreRequisitionById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Store Requisition"),
        },
        storeRequisition,
      ),
    );
  },
);

export const deleteStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::deleteStoreRequisition::controller");
  const id = Number(req.query.storeRequisitionId);

  await storeRequisitionService.deleteStoreRequisition(id);

  logger.info("exiting::deleteStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Store Requisition"),
  });
});

export const rejectStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::rejectStoreRequisition::controller");
  const body = req.body as RejectStoreRequisitionInput;

  await storeRequisitionService.rejectStoreRequisition(body);

  logger.info("exiting::rejectStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition"),
  });
});

export const approveStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::approveStoreRequisition::controller");
  const body = req.body as ApproveStoreReqInput;

  await storeRequisitionService.approveStoreRequisition(body);

  logger.info("exiting::approveStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition"),
  });
});

export const acknowledgeStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::acknowledgeStoreRequisition::controller");
  const body = req.body as AcknowledgeRequisition;

  await storeRequisitionService.acknowledgeStoreRequisition(body);

  logger.info("exiting::acknowledgeStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition"),
  });
});

export const getstoreRequisitionBatchWiseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getstoreRequisitionBatchWiseById::controller");
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const storeRequisition =
      await storeRequisitionService.getStoreRequisitionBatchWiseById(
        Number(storeRequisitionId),
      );

    logger.info("exiting::getstoreRequisitionBatchWiseById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Store Requisition"),
        },
        storeRequisition,
      ),
    );
  },
);

export const getAllStoreRequisitionBatchWiseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStoreRequisitionBatchWiseById::controller");
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const storeRequisition =
      await storeRequisitionService.getAllStoreRequisitionBatchWiseById(
        Number(storeRequisitionId),
      );

    logger.info("exiting::getAllStoreRequisitionBatchWiseById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Store Requisition"),
        },
        storeRequisition,
      ),
    );
  },
);

export const excelStoreReqReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelStoreReqReport::controller");

    const input = req.body as StoreReqExcelFilter;

    const wb: Workbook =
      await storeRequisitionService.buildExcelJSWorkbookForStoreReqByFilter(
        input,
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="store_requisition_report.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
  },
);

export const storeRequisitionPdfById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::storeRequisitionPdfById::controller");

    // 1) Read filters and fetch data
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const str =
      await storeRequisitionService.getStoreRequisitionPdfResponseById(
        Number(storeRequisitionId),
      );
    // 3) Locate template & logo
    const tplDir = path.join(
      process.cwd(),
      "src",
      "templates",
      "pdf",
      "reports-pdf",
      "storeRequisition",
    );
    const bodyTpl = path.join(tplDir, "store-requisition.hbs");
    const base64Image = imageToBase64("public/images/logo.png");

    // 4) Render PDF
    // const pdfBuffer = await generatePDF(bodyTpl, {
    //   str,
    //   base64Image,
    //   reportFor: "Store Requisition",
    //   clinicName: str?.warehouse?.name,
    //   clinicAddress: str?.warehouse?.address,
    //   clinicPhone: str?.warehouse?.phone,
    //   clinicEmail: str?.warehouse?.email,
    // });

    // TODO: Implement PDF generation logic

    // 5) Stream down
    res.status(200).set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="store_requisition.pdf"',
    });
    // .send(pdfBuffer);

    logger.info("exiting::storeRequisitionPdfById::controller");
  },
);
