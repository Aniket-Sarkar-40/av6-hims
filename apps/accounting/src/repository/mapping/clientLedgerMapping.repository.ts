import { db } from "@repo/db";
import { ClientLedgerMapping } from "@repo/db/generated/prisma/client";
import { ClientType } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";

export const getClientLedgerMappingByClientIdAndClientType = async (params: {
  clientId: number;
  clientType: ClientType;
}): Promise<ClientLedgerMapping | null> => {
  logger.info(
    "entering::getClientLedgerMappingByClientIdAndClientType::repository",
  );
  const { clientId, clientType } = params;
  return await db.clientLedgerMapping.findFirst({
    where: {
      clientId,
      clientType,
      isActive: true,
    },
  });
};

export const createClientLedgerMapping = async (params: {
  clientId: number;
  clientType: ClientType;
  ledgerId: number;
  createdBy?: number;
}): Promise<ClientLedgerMapping> => {
  logger.info("entering::createClientLedgerMapping::repository");
  const { clientId, clientType, ledgerId, createdBy } = params;
  return await db.clientLedgerMapping.create({
    data: {
      clientId,
      clientType,
      ledgerId,
      createdBy,
    },
  });
};

export const getClientLedgerMappingByLedgerId = async (params: {
  ledgerId: number;
}): Promise<ClientLedgerMapping | null> => {
  logger.info("entering::getClientLedgerMappingByLedgerId::repository");
  const { ledgerId } = params;
  return await db.clientLedgerMapping.findFirst({
    where: {
      ledgerId,
      isActive: true,
    },
  });
};
