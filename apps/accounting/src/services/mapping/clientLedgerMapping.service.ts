import { auditProxy } from "@/config/audit.config.js";
import { toClientLedgerMappingSingleDto } from "@/mapper/mapping/clientLedgerMapping.mapper.js";
import {
  createClientLedgerMapping,
  getClientLedgerMappingByClientIdAndClientType,
} from "@/repository/mapping/clientLedgerMapping.repository.js";
import {
  ClientLedgerMappingDTO,
  CreateExternalClientLedgerMappingInput,
  FetchClientLedgerMappingInput,
} from "@/types/mapping/clientLedgerMapping.js";
import { createExternalClientLedgerMappingServiceValidation } from "@/validations/service/mapping/clientLedgerMapping.service.validation.js";
import { ClientLedgerMapping } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

const clientLedgerMappingServiceRaw = {
  async createExternalClientLedgerMapping(
    input: CreateExternalClientLedgerMappingInput,
  ): Promise<ClientLedgerMapping> {
    logger.info("entering::createExternalClientLedgerMapping::service");
    const ledgerId =
      await createExternalClientLedgerMappingServiceValidation(input);
    const mapping = await createClientLedgerMapping({
      clientId: input.clientId,
      clientType: input.clientType,
      ledgerId: ledgerId,
      createdBy: input.createdBy,
    });
    logger.info("exiting::createExternalClientLedgerMapping::service");
    return mapping;
  },
  async fetchClientLedgerMapping(
    input: FetchClientLedgerMappingInput,
    canNullReturnable: boolean = true,
  ): Promise<ClientLedgerMappingDTO | null> {
    logger.info("entering::fetchClientLedgerMapping::service");
    const { clientType, clientId } = input;
    const mapping = await getClientLedgerMappingByClientIdAndClientType({
      clientType,
      clientId,
    });
    if (!mapping && !canNullReturnable) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Client Ledger Mapping"),
      );
    }
    logger.info("exiting::fetchClientLedgerMapping::service");
    return mapping ? await toClientLedgerMappingSingleDto(mapping) : null;
  },
};

export const clientLedgerMappingService = auditProxy.createAuditedService(
  "clientLedgerMapping",
  clientLedgerMappingServiceRaw,
);
