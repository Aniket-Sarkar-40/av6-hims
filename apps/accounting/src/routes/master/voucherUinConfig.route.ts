import { Router } from "express";
import {
  createVoucherUINConfig,
  updateVoucherUINConfig,
  deleteVoucherUINConfig,
} from "@/controllers/master/voucherUinConfig.controller.js";

import {
  validateCreateVoucherUINConfig,
  validateUpdateVoucherUINConfig,
} from "@/validations/request/master/voucherUinConfig.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/client";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

export const voucherUINConfigRouter: Router = Router();

voucherUINConfigRouter.post(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_UIN_CONFIG", "CREATE")),
  validateCreateVoucherUINConfig,
  createVoucherUINConfig,
);
voucherUINConfigRouter.put(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_UIN_CONFIG", "UPDATE")),
  validateUpdateVoucherUINConfig,
  updateVoucherUINConfig,
);
voucherUINConfigRouter.delete(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "VOUCHER_UIN_CONFIG", "DELETE")),
  deleteVoucherUINConfig,
);
