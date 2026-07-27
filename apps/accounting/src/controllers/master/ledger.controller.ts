import { ledgerService } from "@/services/master/ledger.service.js";
import {
  CreateOrUpdateLedgerInput,
  LedgerExcelBaseInput,
} from "@/types/master/ledger.js";
import { ClientType } from "@repo/db/generated/prisma/enums.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const createLedger = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createLedger::controller");
  const input = req.body as CreateOrUpdateLedgerInput;
  const created = await ledgerService.createLedger(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: created },
    "Ledger",
  );
  logger.info("exiting::createLedger::controller");
  return res.status(201).json(response);
});

export const updateLedger = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateLedger::controller");
  const input = req.body as CreateOrUpdateLedgerInput;
  const updated = await ledgerService.updateLedger(input);
  const response = BaseResponse.success(
    { type: "UPDATED", data: updated },
    "Ledger",
  );
  logger.info("exiting::updateLedger::controller");
  return res.status(200).json(response);
});

export const deleteLedger = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteLedger::controller");
  const { id } = req.query;
  await ledgerService.deleteLedger(Number(id));
  const response = BaseResponse.success({ type: "DELETED" }, "Ledger");
  logger.info("exiting::deleteLedger::controller");
  return res.status(200).json(response);
});

export const fetchLedgerForExternalMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::fetchLedgerForExternalMapping::controller");
    const { clientType } = req.query as { clientType: ClientType };
    const ledgers = await ledgerService.fetchLedgerForExternalMapping({
      clientType,
    });
    const response = BaseResponse.success(
      { type: "FETCHED", data: ledgers },
      "Ledger",
    );
    logger.info("exiting::fetchLedgerForExternalMapping::controller");
    return res.status(200).json(response);
  },
);

export const createLedgerExcelImport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createLedgerExcelImport::controller");
    const { companyId } = req.body as LedgerExcelBaseInput;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    await ledgerService.createLedgerExcel({
      filePath: req.file.path,
      companyId,
    });

    deleteFileIfExists(req.file.path);

    const response = new BaseResponse({
      success: true,
      message: "Ledger Excel Import started.",
    });

    logger.info("exiting::createLedgerExcelImport::controller");
    return res.status(200).json(response);
  },
);

export const exportLedgerExcel = TryCatch(
  async (_req: Request, res: Response) => {
    logger.info("entering::exportLedgerExcel::controller");

    const data = await ledgerService.buildExcelForLedgerExport();

    const wb: Workbook = data.excel;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ledger_sample_excel.xlsx"`,
    );

    await wb.xlsx.write(res);
    res.end();

    logger.info("exiting::exportLedgerExcel::controller");
  },
);
