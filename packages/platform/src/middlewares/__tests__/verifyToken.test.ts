import type { AuthRequest } from "@repo/shared/types/request.type.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import type { NextFunction, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/shared")>();
  return {
    ...actual,
    TOKEN_VERSION: "V2",
    envMode: "test",
    JWT_TOKEN: "access-token-av6",
    SUPER_ADMIN_ID: 1,
    PERMISSION_PREFIX: "",
  };
});

vi.mock("@repo/shared/utils/auth.utils.js", () => ({
  decodeAccessToken: vi.fn(),
  decodeToken: vi.fn(),
}));

vi.mock("@/cache/redis.utils.js", () => ({
  getCacheLoginById: vi.fn(),
}));

vi.mock("@/logging/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { decodeAccessToken } from "@repo/shared/utils/auth.utils.js";
import { getCacheLoginById } from "@/cache/redis.utils.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { verifyToken } from "../auth.middleware.js";

describe("verifyToken (V2 strategy)", () => {
  let next: NextFunction;
  let res: Response;

  beforeEach(() => {
    next = vi.fn();
    res = {
      clearCookie: vi.fn(),
    } as unknown as Response;
    vi.clearAllMocks();
  });

  it("rejects expired tokens with 401 and clears the auth cookie", async () => {
    const expiredAt = Math.floor(Date.now() / 1000) - 60;
    vi.mocked(decodeAccessToken).mockReturnValue({
      currentLevelZero: null,
      username: "doc",
      userId: 1,
      uuid: "u-1",
      expireAt: expiredAt,
      modules: [ServiceCode.CORE],
    } as ReturnType<typeof decodeAccessToken>);

    const req = {
      headers: { authorization: "Bearer expired-token" },
      cookies: {},
    } as unknown as AuthRequest;

    await verifyToken(ServiceCode.CORE)(req, res, next);

    expect(res.clearCookie).toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as ErrorHandler;
    expect(err).toBeInstanceOf(ErrorHandler);
    expect(err.statusCode).toBe(401);
    expect(err.message).toMatch(/expired/i);
    expect(getCacheLoginById).not.toHaveBeenCalled();
  });

  it("rejects when the token module list does not include the target module", async () => {
    const expireAt = Math.floor(Date.now() / 1000) + 3600;
    vi.mocked(decodeAccessToken).mockReturnValue({
      currentLevelZero: null,
      username: "doc",
      userId: 1,
      uuid: "u-1",
      expireAt,
      modules: [ServiceCode.OPD],
    } as ReturnType<typeof decodeAccessToken>);

    const req = {
      headers: { authorization: "Bearer valid-token" },
      cookies: {},
    } as unknown as AuthRequest;

    await verifyToken(ServiceCode.CORE)(req, res, next);

    const err = (next as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as ErrorHandler;
    expect(err.statusCode).toBe(403);
  });

  it("attaches permissions and calls next for a valid token", async () => {
    const expireAt = Math.floor(Date.now() / 1000) + 3600;
    vi.mocked(decodeAccessToken).mockReturnValue({
      currentLevelZero: { data: { id: 99 } },
      username: "doc",
      userId: 7,
      uuid: "u-7",
      expireAt,
      modules: [ServiceCode.CORE],
    } as ReturnType<typeof decodeAccessToken>);
    vi.mocked(getCacheLoginById).mockResolvedValue({
      permissions: ["ledger", "voucher"],
    });

    const req = {
      headers: { authorization: "Bearer valid-token" },
      cookies: {},
    } as unknown as AuthRequest;

    await verifyToken(ServiceCode.CORE)(req, res, next);

    expect(req.perms).toEqual(new Set(["ledger", "voucher"]));
    expect(req.token).toBe("valid-token");
    expect(next).toHaveBeenCalledWith();
  });
});
