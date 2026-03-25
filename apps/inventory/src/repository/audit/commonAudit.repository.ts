import {
  ItemSupplierMapAuditCreateInput,
  ItemSupplierMapAuditDetailsCreateInput,
} from "@/types/audit/commonAudit.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma } from "@repo/db/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export const CreateItemSupplierMapAudit = async (
  tx: Tx,
  input: ItemSupplierMapAuditCreateInput,
) => {
  logger.info("entering::CreateBranchItemMapAudit::repository");
  return tx.invItemSupplierMapAudit.create({
    data: input,
  });
};

export const CreateItemSupplierMapAuditDetails = async (
  tx: Tx,
  input: ItemSupplierMapAuditDetailsCreateInput,
) => {
  logger.info("entering::CreateBranchItemMapAuditDetails::repository");
  return tx.invItemSuppierMapAuditDetails.create({
    data: input,
  });
};
