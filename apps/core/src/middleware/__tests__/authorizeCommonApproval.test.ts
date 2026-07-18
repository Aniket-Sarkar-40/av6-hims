import type { AuthRequest } from "@repo/shared/types/request.type.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateHashForAuth } from "@repo/shared/utils/helper.utils.js";
import type { NextFunction, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeCommonApproval } from "../auth.middleware.js";

vi.mock("@repo/platform/logging/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("authorizeCommonApproval", () => {
  let next: NextFunction;
  const res = {} as Response;

  beforeEach(() => {
    next = vi.fn();
  });

  it("calls next when client-key matches generateHashForAuth(client-id)", async () => {
    const clientId = "svc-approval-1";
    const headers: Record<string, string> = {
      "client-id": clientId,
      "client-key": generateHashForAuth(clientId),
    };
    const req = {
      header: (name: string) => headers[name.toLowerCase()],
    } as unknown as AuthRequest;

    await authorizeCommonApproval()(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards 403 when client-key is missing", async () => {
    const req = {
      header: () => undefined,
    } as unknown as AuthRequest;

    await authorizeCommonApproval()(req, res, next);

    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]![0] as ErrorHandler;
    expect(err).toBeInstanceOf(ErrorHandler);
    expect(err.statusCode).toBe(403);
  });

  it("forwards 403 when client-key does not match", async () => {
    const headers: Record<string, string> = {
      "client-id": "svc-1",
      "client-key": "deadbeef",
    };
    const req = {
      header: (name: string) => headers[name.toLowerCase()],
    } as unknown as AuthRequest;

    await authorizeCommonApproval()(req, res, next);

    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0]![0] as ErrorHandler;
    expect(err.statusCode).toBe(403);
  });
});
