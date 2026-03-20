import { ClientInternalRes } from "@/types/appointment/appointment.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ClientMaster } from "@repo/db/generated/prisma/client";

export const toCorporateInternalDto = (
  client: ClientMaster,
): ClientInternalRes => {
  logger.info("Mapping client response for id: " + client.id);

  return {
    id: client.id,
    customerName: client.customerName,
    customerCode: client.customerCode,
    contactNo: client.contactNo,
    email: client.email,
    customerPlan: client.customerPlan,
    status: client.status,
  };
};
