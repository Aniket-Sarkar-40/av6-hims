import { describe, expect, it } from "vitest";
import { commonApproveSchema } from "../approval.validation.js";

const validBody = {
  service: "PHARMACY",
  subjectType: "PURCHASE_ORDER",
  id: 42,
  ccId: 1,
  approverId: 9,
  approveType: "APPROVE",
  comment: "ok",
};

describe("commonApproveSchema", () => {
  it("accepts a valid APPROVE payload", () => {
    const { error, value } = commonApproveSchema.validate(validBody);
    expect(error).toBeUndefined();
    expect(value.approveType).toBe("APPROVE");
  });

  it("accepts REJECT and optional empty comment", () => {
    const { error } = commonApproveSchema.validate({
      ...validBody,
      approveType: "REJECT",
      comment: "",
    });
    expect(error).toBeUndefined();
  });

  it("rejects invalid approveType", () => {
    const { error } = commonApproveSchema.validate({
      ...validBody,
      approveType: "MAYBE",
    });
    expect(error).toBeDefined();
    expect(error!.details[0]!.message).toMatch(/APPROVE, REJECT/);
  });

  it("rejects non-positive id", () => {
    const { error } = commonApproveSchema.validate({
      ...validBody,
      id: 0,
    });
    expect(error).toBeDefined();
  });

  it("rejects comments longer than 500 characters", () => {
    const { error } = commonApproveSchema.validate({
      ...validBody,
      comment: "x".repeat(501),
    });
    expect(error).toBeDefined();
  });

  it("requires service, subjectType, id, ccId, approverId, approveType", () => {
    const { error } = commonApproveSchema.validate({}, { abortEarly: false });
    expect(error).toBeDefined();
    const keys = error!.details.map((d) => d.path.join("."));
    expect(keys).toEqual(
      expect.arrayContaining([
        "service",
        "subjectType",
        "id",
        "ccId",
        "approverId",
        "approveType",
      ]),
    );
  });
});
