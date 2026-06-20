import {
  createLedger,
  deleteLedger,
  updateLedger,
} from "@/controllers/master/ledger.controller.js";
import {
  validateCreateLedger,
  validateUpdateLedger,
} from "@/validations/request/master/ledger.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const ledgerRouter: Router = Router();

ledgerRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "LEDGER", "CREATE")),
  validateCreateLedger,
  createLedger
);

ledgerRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "LEDGER", "UPDATE")),
  validateUpdateLedger,
  updateLedger
);

ledgerRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "LEDGER", "DELETE")),
  deleteLedger
);
