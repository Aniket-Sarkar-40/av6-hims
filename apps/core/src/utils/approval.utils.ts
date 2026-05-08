import { ApprovalStatus } from "@repo/db/generated/prisma/enums.js";

export const getFlowWiseApprovalStatus: Record<
  ApprovalStatus,
  Record<string, Record<string, string>>
> = {
  APPROVED: {
    INVENTORY: {
      GRN_RETURN: "1",
      PURCHASE_ORDER: "3",
      REQUISITION: "1",
      INV_PURCHASE_ORDER: "APPROVED",
    },
    PHARMACY: {
      GRN_RETURN: "COMPLETED",
      PURCHASE_ORDER: ApprovalStatus.APPROVED,
    },
  },
  PENDING: {
    INVENTORY: {
      GRN_RETURN: "1",
      PURCHASE_ORDER: "0",
      REQUISITION: "1",
      INV_PURCHASE_ORDER: "PENDING",
    },
    PHARMACY: {
      GRN_RETURN: "DRAFT",
      PURCHASE_ORDER: "SENT_FOR_APPROVAL",
      REQUISITION: "Pending",
    },
  },
  REJECTED: {
    INVENTORY: {
      GRN_RETURN: "0",
      PURCHASE_ORDER: "2",
      REQUISITION: "0",
      INV_PURCHASE_ORDER: "REJECTED",
    },
    PHARMACY: {
      GRN_RETURN: "COMPLETED",
      PURCHASE_ORDER: "REJECTED",
      REQUISITION: "Reject",
    },
  },
  CANCELLED: {
    INVENTORY: {
      GRN_RETURN: "-1",
      PURCHASE_ORDER: "4",
      REQUISITION: "-1",
      INV_PURCHASE_ORDER: "REJECTED",
    },
    PHARMACY: {
      GRN_RETURN: "COMPLETED",
      PURCHASE_ORDER: "REJECTED",
      REQUISITION: "Reject",
    },
  },
  PARTIALLY_APPROVED: {
    INVENTORY: {
      GRN_RETURN: "2",
      PURCHASE_ORDER: "6",
      REQUISITION: "2",
      INV_PURCHASE_ORDER: "PARTIALLY_APPROVED",
    },
    PHARMACY: {
      GRN_RETURN: "COMPLETED",
      PURCHASE_ORDER: "PARTIALLY_APPROVED",
      REQUISITION: "Partially_Approved",
      INV_PURCHASE_ORDER: "PARTIALLY_APPROVED",
    },
  },
};
