import type { AuthRequest } from "@repo/shared/types/request.type.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import type { NextFunction, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorize } from "../auth.middleware.js";

function mockRes(): Response {
  return {
    clearCookie: vi.fn(),
  } as unknown as Response;
}

describe("authorize", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("calls next when SUPER_ADMIN is present (bypasses required perms)", () => {
    const req = {
      perms: new Set(["SUPER_ADMIN"]),
    } as AuthRequest;

    authorize("ledger", "voucher")(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next when all required permissions are present", () => {
    const req = {
      perms: new Set(["ledger", "voucher"]),
    } as AuthRequest;

    authorize("ledger", "voucher")(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards 403 when a required permission is missing", () => {
    const req = {
      perms: new Set(["ledger"]),
    } as AuthRequest;

    authorize("ledger", "voucher")(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]![0] as ErrorHandler;
    expect(err).toBeInstanceOf(ErrorHandler);
    expect(err.statusCode).toBe(403);
  });

  it("forwards 500 when permission set is missing on the request", () => {
    const req = {} as AuthRequest;

    authorize("ledger")(req, mockRes(), next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]![0] as ErrorHandler;
    expect(err).toBeInstanceOf(ErrorHandler);
    expect(err.statusCode).toBe(500);
  });
});
