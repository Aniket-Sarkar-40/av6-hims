import {
  ApprovalStatus,
  GRN_STATUS,
  PO_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";

export const getFlowWiseApprovalStatus: Record<
  ApprovalStatus,
  Record<string, Record<string, string>>
> = {
  APPROVED: {
    INVENTORY: {
      GRN_RETURN: "1",
      PURCHASE_ORDER: "3",
      REQUISITION: "1",
    },
    PHARMACY: {
      GRN_RETURN: GRN_STATUS.COMPLETED,
      PURCHASE_ORDER: PO_STATUS.APPROVED,
      REQUISITION: STORE_REQ_STATUS.Approved,
    },
  },
  PENDING: {
    INVENTORY: {
      GRN_RETURN: "1",
      PURCHASE_ORDER: "0",
      REQUISITION: "1",
    },
    PHARMACY: {
      GRN_RETURN: GRN_STATUS.DRAFT,
      PURCHASE_ORDER: PO_STATUS.SENT_FOR_APPROVAL,
      REQUISITION: STORE_REQ_STATUS.Pending,
    },
  },
  REJECTED: {
    INVENTORY: {
      GRN_RETURN: "0",
      PURCHASE_ORDER: "2",
      REQUISITION: "0",
    },
    PHARMACY: {
      GRN_RETURN: GRN_STATUS.COMPLETED,
      PURCHASE_ORDER: PO_STATUS.REJECTED,
      REQUISITION: STORE_REQ_STATUS.Reject,
    },
  },
  CANCELLED: {
    INVENTORY: {
      GRN_RETURN: "-1",
      PURCHASE_ORDER: "4",
      REQUISITION: "-1",
    },
    PHARMACY: {
      GRN_RETURN: GRN_STATUS.COMPLETED,
      PURCHASE_ORDER: PO_STATUS.REJECTED,
      REQUISITION: STORE_REQ_STATUS.Reject,
    },
  },
  PARTIALLY_APPROVED: {
    INVENTORY: {
      GRN_RETURN: "2",
      PURCHASE_ORDER: "6",
      REQUISITION: "2",
    },
    PHARMACY: {
      GRN_RETURN: GRN_STATUS.COMPLETED,
      PURCHASE_ORDER: PO_STATUS.PARTIALLY_APPROVED,
      REQUISITION: STORE_REQ_STATUS.Partially_Approved,
    },
  },
};
