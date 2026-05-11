import {
  cancelVoucher,
  createVoucher,
  createVoucherExcel,
  createVoucherInvoice,
  deleteVoucher,
  postExternalVoucher,
  updateVoucher,
} from "@/controllers/voucher/voucher.controller.js";
import { authorizeExternalRequest } from "@/middleware/auth.middleware.js";
import {
  validateCreateVoucher,
  validateCreateVoucherExcel,
  validatePostExternalVoucher,
  validateUpdateVoucher,
} from "@/validations/request/voucher/voucher.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

import { Router } from "express";

export const voucherRouter: Router = Router();

voucherRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "CREATE")),
  validateCreateVoucher,
  createVoucher
);

voucherRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "UPDATE")),
  validateUpdateVoucher,
  updateVoucher
);

voucherRouter.post(
  "/external",
  authorizeExternalRequest(),
  validatePostExternalVoucher,
  postExternalVoucher
);

voucherRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "DELETE")),
  deleteVoucher
);

voucherRouter.patch(
  "/cancel",
  verifyToken,
  authorize(getPermission("ACC", "CANCEL_VOUCHER", "CREATE")),
  cancelVoucher
);

voucherRouter.post(
  "/excel-import",
  verifyToken,
  createUploadMiddleware("excelFile"),
  authorize(getPermission("ACC", "VOUCHER_EXCEL_IMPORT", "CREATE")),
  validateCreateVoucherExcel,
  createVoucherExcel
);

voucherRouter.get(
  "/invoice",
  verifyToken,
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "VIEW")),
  createVoucherInvoice
);
