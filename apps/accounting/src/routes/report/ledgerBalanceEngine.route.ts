import { getLedgerBalance } from "@/controllers/report/ledgerBalanceEngine.controller.js";
import { validateLedgerBalanceEngineRequestInput } from "@/validations/request/report/ledgerBalanceEngine.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const ledgerBalanceEngineRouter: Router = Router();

ledgerBalanceEngineRouter.post(
  "/fetch",
  verifyToken,
  authorize(getPermission("ACC", "LEDGER_BALANCE", "VIEW")),
  validateLedgerBalanceEngineRequestInput,
  getLedgerBalance
);
