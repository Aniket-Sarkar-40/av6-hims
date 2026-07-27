import { toggleStatusChequeMaster } from "@/controllers/master/chequeMaster.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const chequeMasterRouter: Router = Router();

chequeMasterRouter.patch(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "CHEQUE_MASTER", "UPDATE")),
  toggleStatusChequeMaster,
);
