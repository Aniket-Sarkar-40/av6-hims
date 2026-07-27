import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "./requestContext.js";

import {
  AuditContextProvider,
  AuditCore,
  AuditLogger,
  AuditProxy,
} from "av6-core-v2";
import { db } from "@repo/db";

const contextProvider: AuditContextProvider<ServiceCode> = () => {
  const store = requestStorage.getStore();
  return {
    userId: store?.user?.id ?? null,
    traceId: store?.traceId ?? null,
    module: "STARTER",
  };
};

const auditCore = new AuditCore<ServiceCode>(
  db,
  contextProvider,
  requestStorage,
);
const auditLogger = new AuditLogger(auditCore);
export const auditProxy = new AuditProxy(auditLogger);
