import {
  changeRole,
  getRoleByCcId,
  getUserDetails,
  login,
  logout,
  verifyPermission,
} from "@/controllers/auth.controller.js";
import { verifyToken } from "@repo/platform/middlewares/auth.middleware.js";
import { Router } from "express";

export const authRouter: Router = Router();

authRouter.post("/login", login);
authRouter.post("/change-role", verifyToken(), changeRole);
authRouter.post("/logout", verifyToken(), logout);
authRouter.post("/role-by-cc", verifyToken(), getRoleByCcId);
authRouter.post(
  "/get-user-details",
  verifyToken(),
  // authorize("pms:user:view"),
  getUserDetails,
);

authRouter.post("/permission", verifyToken(), verifyPermission);

export default authRouter;
