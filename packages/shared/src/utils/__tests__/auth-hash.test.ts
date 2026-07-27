import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { CLIENT_ID } from "../../config/index.js";
import { generateHashForAuth, generateMd5 } from "../helper.utils.js";

describe("generateMd5 / generateHashForAuth", () => {
  it("generateMd5 matches node crypto md5 hex digest", () => {
    const input = "hello-hims";
    const expected = crypto.createHash("md5").update(input).digest("hex");
    expect(generateMd5(input)).toBe(expected);
  });

  it("generateHashForAuth is MD5(MD5(CLIENT_ID) + clientId)", () => {
    const clientId = "approval-callback-123";
    const expected = generateMd5(generateMd5(CLIENT_ID) + clientId);
    expect(generateHashForAuth(clientId)).toBe(expected);
  });

  it("different client ids produce different hashes", () => {
    expect(generateHashForAuth("client-a")).not.toBe(
      generateHashForAuth("client-b"),
    );
  });

  it("uses the configured CLIENT_ID as the salt (wrong salt fails verify)", () => {
    const clientId = "same-id";
    const valid = generateHashForAuth(clientId);
    const forgedWithWrongSalt = generateMd5(
      generateMd5("WRONG_CLIENT_ID") + clientId,
    );
    expect(valid).not.toBe(forgedWithWrongSalt);
  });
});
