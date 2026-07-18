import { LedgerBalanceEngineInput } from "@/types/reports/ledgerBalanceEngine.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { ledgerBalanceService } from "@/services/report/ledgerBalanceEngine.service.js";

export const getLedgerBalance = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getLedgerBalance::report::controller");
    const input = req.body as LedgerBalanceEngineInput;
    const ledgerBalance =
      await ledgerBalanceService.getLedgerBalanceNumber(input);
    const response = BaseResponse.success(
      { data: ledgerBalance, type: "FETCHED" },
      "Ledger Balance",
    );
    logger.info("exiting::getLedgerBalance::report::controller");
    return res.status(200).json(response);
  },
);
