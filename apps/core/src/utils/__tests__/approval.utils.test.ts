import { ApprovalStatus } from "@repo/db/generated/prisma/enums.js";
import { describe, expect, it } from "vitest";
import { getFlowWiseApprovalStatus } from "../approval.utils.js";

describe("getFlowWiseApprovalStatus", () => {
  it("maps pharmacy purchase order approve/reject to domain statuses", () => {
    expect(
      getFlowWiseApprovalStatus.APPROVED.PHARMACY.PURCHASE_ORDER,
    ).toBe(ApprovalStatus.APPROVED);
    expect(
      getFlowWiseApprovalStatus.REJECTED.PHARMACY.PURCHASE_ORDER,
    ).toBe("REJECTED");
    expect(
      getFlowWiseApprovalStatus.PENDING.PHARMACY.PURCHASE_ORDER,
    ).toBe("SENT_FOR_APPROVAL");
  });

  it("maps inventory requisition statuses used by approval callbacks", () => {
    expect(getFlowWiseApprovalStatus.APPROVED.INVENTORY.REQUISITION).toBe("1");
    expect(getFlowWiseApprovalStatus.REJECTED.INVENTORY.REQUISITION).toBe("0");
    expect(
      getFlowWiseApprovalStatus.PARTIALLY_APPROVED.INVENTORY.REQUISITION,
    ).toBe("2");
  });

  it("covers every ApprovalStatus key", () => {
    for (const status of Object.values(ApprovalStatus)) {
      expect(getFlowWiseApprovalStatus[status]).toBeTypeOf("object");
      expect(getFlowWiseApprovalStatus[status].INVENTORY).toBeDefined();
      expect(getFlowWiseApprovalStatus[status].PHARMACY).toBeDefined();
    }
  });
});
