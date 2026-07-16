import {
  cancelVoucher,
  createVoucher,
  createVoucherExcel,
  createVoucherInvoice,
  deleteVoucher,
  exportVoucherExcel,
  postExternalVoucher,
  updateVoucher,
} from "@/controllers/voucher/voucher.controller.js";
import {
  validateCreateVoucher,
  validateCreateVoucherExcel,
  validateExportVoucherExcel,
  validatePostExternalVoucher,
  validateUpdateVoucher,
} from "@/validations/request/voucher/voucher.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const voucherRouter: Router = Router();

voucherRouter.post(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "CREATE")),
  validateCreateVoucher,
  createVoucher
);

voucherRouter.put(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
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
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "DELETE")),
  deleteVoucher
);

voucherRouter.patch(
  "/cancel",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "CANCEL_VOUCHER", "CREATE")),
  cancelVoucher
);

voucherRouter.post(
  "/excel-import",
  verifyToken(ServiceCode.ACCOUNTING),
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("ACC", "VOUCHER_EXCEL_IMPORT", "CREATE")),
  validateCreateVoucherExcel,
  createVoucherExcel
);

voucherRouter.post(
  "/excel-export",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_EXCEL_EXPORT", "CREATE")),
  validateExportVoucherExcel,
  exportVoucherExcel
);

voucherRouter.get(
  "/invoice",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_ENTRY", "VIEW")),
  createVoucherInvoice
);

voucherRouter.post(
  "/single-entry",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_SINGLE_ENTRY", "CREATE")),
  validateCreateVoucher,
  createVoucher
);

voucherRouter.put(
  "/single-entry",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_SINGLE_ENTRY", "UPDATE")),
  validateUpdateVoucher,
  updateVoucher
);
