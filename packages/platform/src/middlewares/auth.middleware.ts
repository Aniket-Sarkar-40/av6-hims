import { getCacheLoginById } from "@/cache/redis.utils.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
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
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

/**
 * Extracts the raw token from the request. In `test` mode we read the bearer
 * header (so tests can inject tokens); otherwise the httpOnly cookie is used.
 */
function extractToken(req: AuthRequest): string {
  if (envMode.toLowerCase() === "test") {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ErrorHandler(401, "Missing bearer token");
    }
    return authHeader.split(" ")[1]!;
  }

  const token = req.cookies?.[JWT_TOKEN] as string | undefined;
  if (!token) {
    throw new ErrorHandler(401, "Missing token");
  }
  return token;
}

function clearAuthCookie(res: Response) {
  res.clearCookie(JWT_TOKEN, {
    httpOnly: true,
    secure: envMode.toLowerCase() === "production",
    sameSite: "lax",
    path: "/",
    domain: envMode.toLowerCase() === "production" ? ".av6.co.in" : undefined,
  });
}

/**
 * Legacy (V1) token verification strategy.
 */
async function tokenStrategyV1(
  req: AuthRequest,
  _res: Response,
  token: string,
  module: ServiceCode
): Promise<void> {
  const payload = decodeToken(token);
  const {
    role,
    expire_at,
    username,
    email,
    contact_no,
    id,
    uuid,
    cc_id,
    modules,
  } = payload;

  if (!modules.includes(module)) {
    throw new ErrorHandler(403, "You are not authorized to use this module");
  }

  const cache = (await getCacheLoginById(AUTH.OLD_LOGIN_CACHE_KEY, uuid)) as
    | { roles: Record<string, string>[]; permissions: string[] }
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

  req.perms = new Set(permissions);
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
    store.ccId = Number(cc_id);
  }
}

/**
 * Current (V2) token verification strategy.
 */
async function tokenStrategyV2(
  req: AuthRequest,
  res: Response,
  token: string,
  module: ServiceCode
): Promise<void> {
  const payload = decodeAccessToken(token);
  const { currentLevelZero, username, userId, uuid, expireAt, modules } =
    payload;

  // FIX: previously the cookie was cleared but execution continued, so expired
  // tokens were still accepted. Clear the cookie AND reject the request.
  if (expireAt * 1000 < Date.now()) {
    clearAuthCookie(res);
    throw new ErrorHandler(401, "Token expired");
  }

  if (!modules.includes(module)) {
    throw new ErrorHandler(403, "You are not authorized to use this module");
  }

  const cache = (await getCacheLoginById(AUTH.NEW_LOGIN_CACHE_KEY, uuid)) as
    | { permissions: string[] }
    | undefined;

  if (!cache?.permissions) {
    throw new ErrorHandler(401, "No permissions found for the user");
  }

  const { permissions } = cache;

  if (currentLevelZero) {
    const roleId = currentLevelZero.data?.id;
    if (roleId === SUPER_ADMIN_ID) {
      permissions.push("SUPER_ADMIN");
    }
  }

  req.perms = new Set(permissions);
  req.token = token;

  const store = requestStorage.getStore();
  if (store) {
    store.user = {
      userName: username,
      id: Number(userId),
      role: currentLevelZero,
    };
    store.token = token;
    store.perms = req.perms;
  }
}

const strategies = {
  V1: tokenStrategyV1,
  V2: tokenStrategyV2,
} as const;

export const verifyToken =
  (module: ServiceCode = ServiceCode.CORE) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      const strategy = TOKEN_VERSION === "V1" ? strategies.V1 : strategies.V2;
      await strategy(req, res, token, module);
      next();
    } catch (error) {
      logger.error("verifyToken failed:", error);
      next(error);
    }
  };

export const authorize =
  (...required: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      logger.info("entering::authorization ::middleware");

      if (!req.perms) {
        throw new ErrorHandler(500, "Permission set missing.");
      }

      if (req.perms.has("SUPER_ADMIN")) {
        logger.info("exiting::authorization ::middleware");
        return next();
      }

      const ok = required.every((p) =>
        req.perms!.has(`${PERMISSION_PREFIX}${p}`)
      );
      if (!ok) throw new ErrorHandler(403, "You are not authorized.");

      logger.info("exiting::authorization ::middleware");
      next();
    } catch (error) {
      logger.error("authorize failed:", error);
      next(error);
    }
  };
