import {
  createGroupExcelImport,
  deleteGroup,
  exportGroupExcel,
} from "@/controllers/master/group.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const groupRouter: Router = Router();

groupRouter.post(
  "/excel-import",
  verifyToken(ServiceCode.ACCOUNTING),
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("ACC", "GROUP_EXCEL_IMPORT", "CREATE")),
  validateCreateGroupExcel,
  createGroupExcelImport
);

groupRouter.get(
  "/excel-export",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "GROUP_EXCEL_EXPORT", "CREATE")),
  exportGroupExcel
);

groupRouter.delete(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "GROUP", "DELETE")),
  deleteGroup
);
