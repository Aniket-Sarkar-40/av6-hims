import {
  createAccountingIntegrationConfig,
  getIntegrationConfigKeys,
  updateAccountingIntegrationConfig,
} from "@/controllers/integrationConfig/accountingIntegrationConfig.controller.js";
import {
  validateCreateAccountingIntegrationConfig,
  validateUpdateAccountingIntegrationConfig,
} from "@/validations/request/integrationConfig/accountingIntegrationConfig.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const accountingIntegrationConfigRoutes: Router = Router();

accountingIntegrationConfigRoutes.post(
  "/",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "INTEGRATION_CONFIG", "CREATE")),
  validateCreateAccountingIntegrationConfig,
  createAccountingIntegrationConfig,
);

accountingIntegrationConfigRoutes.put(
  "/",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "INTEGRATION_CONFIG", "UPDATE")),
  validateUpdateAccountingIntegrationConfig,
  updateAccountingIntegrationConfig,
);

accountingIntegrationConfigRoutes.get(
  "/keys",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "INTEGRATION_CONFIG", "VIEW")),
  getIntegrationConfigKeys,
);
