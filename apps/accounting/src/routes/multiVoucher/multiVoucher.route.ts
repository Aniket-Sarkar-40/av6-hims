import {
  createMultiVoucher,
  deleteMultiVoucherById,
  updateMultiVoucher,
  updatePostedMultiVoucher,
  getMultiVoucherInvoice,
} from "@/controllers/multiVoucher/multiVoucher.controller.js";
import {
  validateCreateMultiVoucher,
  validateUpdateMultiVoucher,
  validateUpdatePostedMultiVoucher,
} from "@/validations/request/multiVoucher/multiVoucher.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/client";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const multiVoucherRouter: Router = Router();

multiVoucherRouter.post(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "MULTI_VOUCHER", "CREATE")),
  validateCreateMultiVoucher,
  createMultiVoucher
);

multiVoucherRouter.put(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "MULTI_VOUCHER", "UPDATE")),
  validateUpdateMultiVoucher,
  updateMultiVoucher
);

multiVoucherRouter.put(
  "/posted",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "UPDATE_POSTED_MULTI_VOUCHER", "UPDATE")),
  validateUpdatePostedMultiVoucher,
  updatePostedMultiVoucher
);

multiVoucherRouter.delete(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "MULTI_VOUCHER", "DELETE")),
  deleteMultiVoucherById
);

multiVoucherRouter.get(
  "/invoice",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "MULTI_VOUCHER", "VIEW")),
  getMultiVoucherInvoice
);

export default multiVoucherRouter;
