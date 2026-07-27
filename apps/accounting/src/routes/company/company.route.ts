import {
  createCompany,
  updateCompany,
} from "@/controllers/company/company.controller.js";
import {
  validateCreateCompany,
  validateUpdateCompany,
} from "@/validations/request/company/company.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const companyRouter: Router = Router();

companyRouter.post(
  "/",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "COMPANY", "CREATE")),
  validateCreateCompany,
  createCompany,
);

companyRouter.put(
  "/",
  verifyToken("ACCOUNTING"),
  authorize(getPermission("ACC", "COMPANY", "UPDATE")),
  validateUpdateCompany,
  updateCompany,
);
