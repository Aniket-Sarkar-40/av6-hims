import { ledgerService } from "@/services/master/ledger.service.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createLedger = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createLedger::controller");
  const input = req.body as CreateOrUpdateLedgerInput;
  const created = await ledgerService.createLedger(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: created },
    "Ledger"
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
    "Ledger"
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
