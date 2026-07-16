import {
  exportChartOfAccountsExcel,
  fetchChartOfAccounts,
} from "@/controllers/master/chartOfAccounts.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const chartOfAccountsRouter: Router = Router();

chartOfAccountsRouter.get(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "CHART_OF_ACCOUNTS", "VIEW")),
  fetchChartOfAccounts
);

chartOfAccountsRouter.get(
  "/export-excel",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "CHART_OF_ACCOUNTS", "VIEW")),
  exportChartOfAccountsExcel
);
