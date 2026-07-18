import { multiVoucherService } from "@/services/multiVoucher/multiVoucher.service.js";
import { Request, Response } from "express";
import { CreateOrUpdateMultiVoucherInput } from "@/types/multiVoucher/multiVoucher.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const createMultiVoucher = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createMultiVoucher::controller");
    const input = req.body as CreateOrUpdateMultiVoucherInput;
    const created = await multiVoucherService.createMultiVoucher(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Multi Voucher"
    );
    logger.info("exiting::createMultiVoucher::controller");
    return res.status(201).json(response);
  }
);
export const updateMultiVoucher = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMultiVoucher::controller");
    const input = req.body as CreateOrUpdateMultiVoucherInput;
    const updated = await multiVoucherService.updateMultiVoucher(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Multi Voucher"
    );
    logger.info("exiting::updateMultiVoucher::controller");
    return res.status(200).json(response);
  }
);
export const deleteMultiVoucherById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteMultiVoucherById::controller");
    const { multiVoucherId } = req.query as { multiVoucherId: string };
    const deleted = await multiVoucherService.deleteMultiVoucherById(
      Number(multiVoucherId)
    );
    const response = BaseResponse.success(
      { type: "DELETED", data: deleted },
      "Multi Voucher"
    );
    logger.info("exiting::deleteMultiVoucherById::controller");
    return res.status(200).json(response);
  }
);
export const updatePostedMultiVoucher = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePostedMultiVoucher::controller");
    const input = req.body as CreateOrUpdateMultiVoucherInput;
    const updated = await multiVoucherService.updatePostedMultiVoucher(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Multi Voucher"
    );
    logger.info("exiting::updatePostedMultiVoucher::controller");
    return res.status(200).json(response);
  }
);

export const getMultiVoucherInvoice = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMultiVoucherInvoice::controller");

    const { multiVoucherId } = req.query as { multiVoucherId: string };

    const data = await multiVoucherService.buildPdfForMultiVoucherInvoice(
      Number(multiVoucherId)
    );

    const pdfBuffer = data.pdf;
    const voucherType = data.voucherType;
    const voucherDate = data.voucherDate;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${voucherType}_voucher_${voucherDate}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.end(pdfBuffer);

    logger.info("exiting::getMultiVoucherInvoice::controller");
  }
);
