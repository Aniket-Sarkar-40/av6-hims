import { TryCatch } from "@repo/platform";
import { authService } from "@/services/auth.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { processAndRecreateJWT } from "@repo/shared/utils/helper.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import {
  addToCacheForLogin,
  deleteCacheLogin,
} from "@repo/platform/cache/redis.utils.js";
import { envMode } from "@repo/shared";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";

const SEVENTEEN_HOURS = 1000 /*ms*/ * 60 /*sec*/ * 60 /*min*/ * 17; /*hrs*/

export const LOGIN_KEY = `pms:login`;

export const login = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::login::controller");
  const { username, password } = req.body;
  const { token, shortToken, uuid } = await authService.login({
    username,
    password,
  });

  const rolePermission = processAndRecreateJWT(token);
  await addToCacheForLogin(
    LOGIN_KEY,
    uuid,
    {
      roles: rolePermission.roles,
      permissions: rolePermission.permissions,
      // token: token,
      // shortToken: shortToken,
    },
    SEVENTEEN_HOURS / 1000,
  );

  res.cookie("access-token-pms", shortToken, {
    httpOnly: true,
    secure: envMode === "PRODUCTION",
    sameSite: "lax",
    maxAge: SEVENTEEN_HOURS,
    path: "/",
    domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
  });

  logger.info("exiting::login::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: "Logged in successfully",
      },
      // { token }
      envMode.toUpperCase() === "TEST" ? { token: shortToken } : { token },
    ),
  );
});

export const logout = TryCatch(async (req: AuthRequest, res: Response) => {
  logger.info("entering::logout::controller");

  const decodedToken = authService.decodeToken(req.token as string);

  if (!decodedToken || !decodedToken.uuid) {
    throw new ErrorHandler(401, "Invalid token");
  }

  // Clear the cache for the user
  await deleteCacheLogin(LOGIN_KEY, decodedToken.uuid);

  res.clearCookie("access-token-pms", {
    httpOnly: true,
    secure: envMode === "PRODUCTION",
    sameSite: "lax",
    path: "/", // must match the path you originally set
    domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
  });
  logger.info("exiting::logout::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: "Logged out successfully",
    }),
  );
});
export const getUserDetails = TryCatch(
  async (req: AuthRequest, res: Response) => {
    logger.info("entering::getUserDetails::controller");
    if (!req.token) throw new ErrorHandler(401, "Missing Token");
    const getDetailsUser = await authService.userDetails();
    logger.info("exiting::getUserDetails::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "User Details"),
        },
        getDetailsUser,
      ),
    );
  },
);

export const changeRole = TryCatch(async (req: AuthRequest, res: Response) => {
  logger.info("entering::changeRole::controller");
  const { roleId, ccId } = req.body;
  if (!req.token) throw new ErrorHandler(401, "Missing Token");

  const decodedToken = authService.decodeToken(req.token as string);

  if (!decodedToken || !decodedToken.uuid) {
    throw new ErrorHandler(401, "Invalid token");
  }

  const { token, shortToken, uuid } = await authService.changeRole(
    roleId,
    ccId,
  );

  const rolePermission = processAndRecreateJWT(token);
  await deleteCacheLogin(LOGIN_KEY, decodedToken.uuid);

  await addToCacheForLogin(
    LOGIN_KEY,
    uuid,
    {
      roles: rolePermission.roles,
      permissions: rolePermission.permissions,
    },
    SEVENTEEN_HOURS / 1000,
  );

  res.cookie("access-token-pms", shortToken, {
    httpOnly: true,
    secure: envMode === "PRODUCTION",
    sameSite: "lax",
    maxAge: SEVENTEEN_HOURS,
    path: "/",
    domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
  });

  logger.info("exiting::changeRole::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: "Role changed successfully",
      },
      envMode.toUpperCase() === "TEST" ? { token: shortToken } : { token },
    ),
  );
});

export const getRoleByCcId = TryCatch(
  async (req: AuthRequest, res: Response) => {
    logger.info("entering::getRoleByCcId::controller");
    if (!req.token) throw new ErrorHandler(401, "Missing Token");
    const { ccId } = req.body as { ccId: number };

    const getDetailsUser = await authService.getRoleByCcId(Number(ccId));
    logger.info("exiting::getRoleByCcId::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Role By Cc Id"),
        },
        getDetailsUser,
      ),
    );
  },
);

export const verifyPermission = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPermission::controller");

    const reqPermissions = req.body.permissions as string[];

    const permissions = requestStorage.getStore()?.perms;

    let isAuthorized = false;
    if (permissions) {
      if (permissions.has("SUPER_ADMIN")) {
        isAuthorized = true;
      } else {
        const ok = reqPermissions.every((p) => permissions.has(p));
        if (ok) isAuthorized = true;
      }
    }

    const response = BaseResponse.success(
      { type: "FETCHED", data: { isAuthorized } },
      "Permission",
    );

    logger.info("exiting::getPermission::controller");
    return res.status(200).json(response);
  },
);
