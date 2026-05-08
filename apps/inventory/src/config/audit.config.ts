import {
  AuditContextProvider,
  AuditCore,
  AuditLogger,
  AuditProxy,
} from "av6-core-v2";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";

/**
 * ALS-based context provider
 * You can extend this to include ccId, etc.
 */
const contextProvider: AuditContextProvider<"INV"> = () => {
  const store = requestStorage.getStore();
  return {
    userId: store?.user?.id ?? null,
    traceId: store?.traceId ?? null,
    level1Id: store?.ccId ?? null,
    level2Id: null,
    module: "INV",
  };
};

const auditCore = new AuditCore<"INV">(db, contextProvider, requestStorage);
const auditLogger = new AuditLogger<"INV">(auditCore);
export const auditProxy = new AuditProxy<"INV">(auditLogger);
