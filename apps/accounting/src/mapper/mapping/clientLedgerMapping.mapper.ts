import { getCorporateByIdFromDb } from "@/repository/clientMaster/corporate.repository.js";
import { getInsuranceByIdFromDb } from "@/repository/clientMaster/insurance.repository.js";
import { getInventorySupplierByIdFromDb } from "@/repository/invSupplier/inventorySupplier.repository.js";
import { getPmsDistributorById } from "@/repository/pmsDistributor/pmsDistributor.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { ClientLedgerMappingDTO } from "@/types/mapping/clientLedgerMapping.js";
import { customOmit, toIdValue } from "av6-utils";
import { IdValue } from "@/types/global.js";
import {
  ClientLedgerMapping,
  ClientType,
} from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const toClientLedgerMappingDto = async (
  input: ClientLedgerMapping[]
): Promise<ClientLedgerMappingDTO[]> => {
  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const response: ClientLedgerMappingDTO[] = await Promise.all(
    input.map(async (clientLedgerMapping) => {
      const omittedData = customOmit(clientLedgerMapping, [
        "ledgerId",
        "clientId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "deletedBy",
        "isActive",
      ]);

      let clientDto: IdValue | null = null;
      switch (clientLedgerMapping.clientType) {
        case ClientType.CORPORATE: {
          const client = await getCorporateByIdFromDb(
            clientLedgerMapping.clientId
          );
          clientDto = toIdValue(client, "customerName");
          break;
        }
        case ClientType.INSURANCE: {
          const client = await getInsuranceByIdFromDb(
            clientLedgerMapping.clientId
          );
          clientDto = toIdValue(client, "customerName");
          break;
        }
        case ClientType.PMS_DISTRIBUTOR: {
          const client = await getPmsDistributorById(
            clientLedgerMapping.clientId
          );
          clientDto = toIdValue(client, "proInName");
          break;
        }
        case ClientType.INV_ITEM_SUPPLIER: {
          const client = await getInventorySupplierByIdFromDb(
            clientLedgerMapping.clientId
          );
          clientDto = toIdValue(client, "vendorCompanyName");
          break;
        }
        case ClientType.BANK_OR_CASH: {
          const client = await getCashAndBankHeadByIdFromDb(
            clientLedgerMapping.clientId
          );
          clientDto = toIdValue(client, "name");
          break;
        }
        default: {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Client Type")
          );
        }
      }

      return {
        ...omittedData.rest,
        ledger: toIdValue(
          ledgers.find((ledger) => ledger.id === clientLedgerMapping.ledgerId),
          "name"
        ),
        client: clientDto,
      };
    })
  );
  return response;
};

export const toClientLedgerMappingSingleDto = async (
  input: ClientLedgerMapping
): Promise<ClientLedgerMappingDTO> => {
  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });
  const omittedData = customOmit(input, [
    "ledgerId",
    "clientId",
    "createdAt",
    "createdBy",
    "updatedAt",
    "updatedBy",
    "deletedAt",
    "deletedBy",
    "isActive",
  ]);

  let clientDto: IdValue | null = null;
  switch (input.clientType) {
    case ClientType.CORPORATE: {
      const client = await getCorporateByIdFromDb(input.clientId);
      clientDto = toIdValue(client, "customerName");
      break;
    }
    case ClientType.INSURANCE: {
      const client = await getInsuranceByIdFromDb(input.clientId);
      clientDto = toIdValue(client, "customerName");
      break;
    }
    case ClientType.PMS_DISTRIBUTOR: {
      const client = await getPmsDistributorById(input.clientId);
      clientDto = toIdValue(client, "proInName");
      break;
    }
    case ClientType.INV_ITEM_SUPPLIER: {
      const client = await getInventorySupplierByIdFromDb(input.clientId);
      clientDto = toIdValue(client, "vendorCompanyName");
      break;
    }
    case ClientType.BANK_OR_CASH: {
      const client = await getCashAndBankHeadByIdFromDb(input.clientId);
      clientDto = toIdValue(client, "name");
      break;
    }
    default: {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Client Type")
      );
    }
  }

  return {
    ...omittedData.rest,
    ledger: toIdValue(
      ledgers.find((ledger) => ledger.id === input.ledgerId),
      "name"
    ),
    client: clientDto,
  };
};
