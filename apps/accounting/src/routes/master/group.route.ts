import { deleteGroup } from "@/controllers/master/group.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const groupRouter: Router = Router();

groupRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "GROUP", "DELETE")),
  deleteGroup
);
