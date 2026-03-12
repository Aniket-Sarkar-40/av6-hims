import { getCacheLoginById } from "@/cache/redis.utils.js";
import { requestStorage } from "@/config/requestContext.js";
import { logger } from "@/logging/logger.js";
import {
  envMode,
  JWT_TOKEN,
  PERMISSION_PREFIX,
  SUPER_ADMIN_ID,
  TOKEN_VERSION,
} from "@repo/shared";
import { AUTH } from "@repo/shared/config/auth.config.js";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import {
  decodeAccessToken,
  decodeToken,
} from "@repo/shared/utils/auth.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { NextFunction, Response } from "express";
import { TryCatch } from "./error.middleware.js";

export const verifyToken = TryCatch(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (envMode.toLowerCase() === "test") {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new ErrorHandler(401, "Missing bearer token");
      }
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies[JWT_TOKEN] as string | undefined;
    }

    if (!token) {
      throw new ErrorHandler(401, "Missing token");
    }

    if (TOKEN_VERSION === "V1") {
      const payload = decodeToken(token);
      const { role, expire_at, username, email, contact_no, id, uuid, cc_id } =
        payload;

      const cache = (await getCacheLoginById(
        AUTH.OLD_LOGIN_CACHE_KEY,
        uuid
      )) as
        | {
            roles: Record<string, string>[];
            permissions: string[];
          }
        | undefined;

      if (!cache) {
        throw new ErrorHandler(401, "No permissions found for the user");
      }

      const { roles, permissions } = cache;

      if (expire_at * 1000 < Date.now()) {
        throw new ErrorHandler(401, "Token expired");
      }

      const roleName = Object.keys(role)[0];
      if (roleName === "Super Admin") {
        permissions.push("SUPER_ADMIN");
      }

      req.perms = new Set(permissions.map((p) => p));
      req.token = token;

      const store = requestStorage.getStore();
      if (store) {
        store.user = {
          contactNo: contact_no,
          email,
          userName: username,
          id: Number(id),
          roles,
          role,
        };
        store.token = token;
        store.perms = req.perms;
        // store.settings = await settingsService.getSettings(true);
        store.ccId = Number(cc_id);
      }
      next();
    } else {
      const payload = decodeAccessToken(token);
      const { currentLevelZero, username, userId, uuid, expireAt } = payload;
      if (expireAt * 1000 < Date.now()) {
        res.clearCookie(JWT_TOKEN, {
          httpOnly: true,
          secure: envMode.toLowerCase() === "production",
          sameSite: "lax",
          path: "/",
          domain:
            envMode.toLowerCase() === "production" ? ".av6.co.in" : undefined,
        });
      }

      const cache = (await getCacheLoginById(
        AUTH.NEW_LOGIN_CACHE_KEY,
        uuid
      )) as
        | {
            permissions: string[];
          }
        | undefined;

      if (!cache) {
        throw new ErrorHandler(401, "No permissions found for the user");
      }

      const { permissions } = cache;
      if (!permissions) {
        throw new ErrorHandler(401, "No permissions found for the user");
      }

      if (currentLevelZero) {
        const roleId = currentLevelZero.data?.id;
        if (roleId === SUPER_ADMIN_ID) {
          permissions.push("SUPER_ADMIN");
        }
      }

      req.perms = new Set(permissions.map((p) => p));

      const store = requestStorage.getStore();
      if (store) {
        store.user = {
          userName: username,
          id: Number(userId),
          role: currentLevelZero,
        };
        store.token = token;
        store.perms = req.perms;
        // store.settings = await settingsService.getSettings(true);
      }

      next();
    }
  }
);

export const authorize =
  (...required: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      logger.info("entering::authorization ::middleware");

      if (!req.perms) {
        throw new ErrorHandler(500, "Permission set missing.");
      }
      if (req.perms.has("SUPER_ADMIN")) {
        logger.info("exiting::authorization ::middleware");
        next();
      } else {
        const ok = required.every((p) =>
          req.perms!.has(`${PERMISSION_PREFIX}${p}`)
        );
        if (!ok) throw new ErrorHandler(403, "You are not authorized.");
        logger.info("exiting::authorization ::middleware");
        next();
      }
    } catch (error) {
      logger.error("Error Occurred -------------> " + JSON.stringify(error));
      next(error);
    }
  };
