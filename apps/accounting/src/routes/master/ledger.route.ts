import {
  createLedger,
  createLedgerExcelImport,
  deleteLedger,
  exportLedgerExcel,
  fetchLedgerForExternalMapping,
  updateLedger,
} from "@/controllers/master/ledger.controller.js";
import { authorizeExternalRequest } from "@/middleware/auth.middleware.js";
import {
  validateCreateLedger,
  validateCreateLedgerExcel,
  validateUpdateLedger,
} from "@/validations/request/master/ledger.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/client";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const ledgerRouter: Router = Router();

ledgerRouter.post(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "LEDGER", "CREATE")),
  validateCreateLedger,
  createLedger
);

ledgerRouter.put(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "LEDGER", "UPDATE")),
  validateUpdateLedger,
  updateLedger
);

ledgerRouter.delete(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "LEDGER", "DELETE")),
  deleteLedger
);

ledgerRouter.get(
  "/external-fetch",
  authorizeExternalRequest(),
  fetchLedgerForExternalMapping
);

ledgerRouter.get(
  "/fetch",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "LEDGER", "VIEW")),
  fetchLedgerForExternalMapping
);

ledgerRouter.post(
  "/excel-import",
  verifyToken(ServiceCode.ACCOUNTING),
  createUploadMiddleware("excel"),
  uploadToHetzner("excel"),
  authorize(getPermission("ACC", "LEDGER_EXCEL_IMPORT", "CREATE")),
  validateCreateLedgerExcel,
  createLedgerExcelImport
);

ledgerRouter.get(
  "/excel-export",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "LEDGER_EXCEL_EXPORT", "CREATE")),
  exportLedgerExcel
);
