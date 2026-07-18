import { voucherService } from "@/services/voucher/voucher.service.js";
import {
  CreateOrUpdateVoucherInput,
  ExternalPostVoucherInput,
} from "@/types/voucher/voucher.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const createVoucher = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createVoucher::controller");
  const input = req.body as CreateOrUpdateVoucherInput;
  const created = await voucherService.createVoucher(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: created },
    "Voucher",
  );
  logger.info("exiting::createVoucher::controller");
  return res.status(201).json(response);
});

export const updateVoucher = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateVoucher::controller");
  const input = req.body as CreateOrUpdateVoucherInput;
  const created = await voucherService.updateVoucher(input);
  const response = BaseResponse.success(
    { type: "UPDATED", data: created },
    "Voucher",
  );
  logger.info("exiting::updateVoucher::controller");
  return res.status(200).json(response);
});

export const postExternalVoucher = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::postExternalVoucher::controller");
    const input = req.body as ExternalPostVoucherInput;
    const posted = await voucherService.postExternalVoucher(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: posted },
      "Voucher",
    );
    logger.info("exiting::postExternalVoucher::controller");
    return res.status(201).json(response);
  },
);

export const deleteVoucher = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteVoucher::controller");
  const { voucherId } = req.query as { voucherId: string };
  await voucherService.deleteVoucher(Number(voucherId));
  const response = BaseResponse.success({ type: "DELETED" }, "Voucher");
  logger.info("exiting::deleteVoucher::controller");
  return res.status(200).json(response);
});

export const cancelVoucher = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::cancelVoucher::controller");
  const { voucherId } = req.query as { voucherId: string };
  await voucherService.cancelVoucher(Number(voucherId));
  const response = BaseResponse.success({ type: "CANCELLED" }, "Voucher");
  logger.info("exiting::cancelVoucher::controller");
  return res.status(200).json(response);
});

export const createVoucherExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createVoucherExcel::controller");
    const { ccId, voucherTypeId } = req.body as {
      ccId: string;
      voucherTypeId: string;
    };

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }
    await voucherService.createVoucherExcel({
      filePath: req.file.path,
      ccId: Number(ccId),
      voucherTypeId: Number(voucherTypeId),
    });

    deleteFileIfExists(req.file.path);

    const response = new BaseResponse({
      success: true,
      message: "Voucher Excel Import started.",
    });
    logger.info("exiting::createVoucherExcel::controller");
    return res.status(200).json(response);
  },
);

export const createVoucherInvoice = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createVoucherInvoice::controller");

    const { voucherId } = req.query as { voucherId: string };

    const data = await voucherService.buildPdfForVoucherInvoice(
      Number(voucherId),
    );

    const pdfBuffer = data.pdf;
    const voucherNo = data.voucherNo;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="voucher_${voucherNo}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);

    logger.info("exiting::createVoucherInvoice::controller");
  },
);

export const exportVoucherExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::exportVoucherExcel::controller");

    const { voucherTypeId } = req.body as { voucherTypeId: string };

    const data = await voucherService.buildExcelForVoucherExport(
      Number(voucherTypeId),
    );

    const wb: Workbook = data.excel;

    const name = data.name;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${name}_sample_excel.xlsx"`,
    );

    await wb.xlsx.write(res);
    res.end();

    logger.info("exiting::exportVoucherExcel::controller");
  },
);
