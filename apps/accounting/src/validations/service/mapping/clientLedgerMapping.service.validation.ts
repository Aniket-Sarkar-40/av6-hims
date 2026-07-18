import {
  getClientLedgerMappingByClientIdAndClientType,
  getClientLedgerMappingByLedgerId,
} from "@/repository/mapping/clientLedgerMapping.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { ledgerService } from "@/services/master/ledger.service.js";
import {
  CreateExternalClientLedgerMappingInput,
  MAPPING_STATUS,
} from "@/types/mapping/clientLedgerMapping.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { validateIdLedger } from "../master/ledger.service.validation.js";
import { validateIdCurrency } from "../master/currency.service.validation.js";
import { ClientType } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { DEFAULT_COMPANY_ID } from "@repo/shared";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export const GROUP_NAME_FOR_CLIENT_TYPE = {
  [ClientType.CORPORATE]: "Sundry Debtors",
  [ClientType.INSURANCE]: "Sundry Debtors",
  [ClientType.PMS_DISTRIBUTOR]: "Sundry Creditors",
  [ClientType.INV_ITEM_SUPPLIER]: "Sundry Creditors",
};

export const createExternalClientLedgerMappingServiceValidation = async (
  input: CreateExternalClientLedgerMappingInput,
) => {
  logger.info(
    "entering::createExternalClientLedgerMappingServiceValidation::service::validation",
  );
  const {
    clientId,
    clientType,
    ledgerId,
    mappingStatus,
    ledgerName,
    currencyId,
    creditPeriodInDays,
    overrideExistingLedger,
  } = input;

  let ledgerIdToReturn: number = ledgerId ?? 0;

  const allGroups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });
  const groups = allGroups.filter((g) => g.companyId === DEFAULT_COMPANY_ID);
  if (currencyId) {
    await validateIdCurrency(currencyId);
  }

  const existingMapping = await getClientLedgerMappingByClientIdAndClientType({
    clientId,
    clientType,
  });

  if (existingMapping) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Client Ledger Mapping"),
    );
  }

  if (ledgerId) {
    const ledger = await validateIdLedger(ledgerId);
    const existingMappingByLedgerId = await getClientLedgerMappingByLedgerId({
      ledgerId,
    });
    if (existingMappingByLedgerId) {
      throw new ErrorHandler(400, "Ledger already mapped to another client");
    }
    //check if currency and credit period is different from the existing ledger
    if (overrideExistingLedger === null) {
      if (ledger.currencyId !== currencyId) {
        throw new ErrorHandler(
          400,
          "Provided currency is different from existing ledger currency",
        );
      }
      if (ledger.creditPeriodInDays !== creditPeriodInDays) {
        throw new ErrorHandler(
          400,
          "Provided credit period is different from existing ledger credit period",
        );
      }
    } else if (overrideExistingLedger === true) {
      if (
        ledger.currencyId !== currencyId ||
        ledger.creditPeriodInDays !== creditPeriodInDays
      ) {
        const patchLedgerInput: Pick<
          CreateOrUpdateLedgerInput,
          "id" | "currencyId" | "creditPeriodInDays"
        > = {
          id: ledger.id,
          currencyId: currencyId,
          creditPeriodInDays: creditPeriodInDays,
        };
        await ledgerService.patchLedger(patchLedgerInput);
      }
    }
    const groupName =
      GROUP_NAME_FOR_CLIENT_TYPE[
        clientType as keyof typeof GROUP_NAME_FOR_CLIENT_TYPE
      ];

    const group = groups.find((g) => g.name === groupName);
    if (!group) {
      throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Group"));
    }
    if (ledger.groupId !== group.id) {
      throw new ErrorHandler(400, "Ledger with invalid group provided");
    }
  }

  if (mappingStatus === MAPPING_STATUS.CREATE) {
    if (!ledgerName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Ledger Name"),
      );
    }

    switch (clientType) {
      case ClientType.CORPORATE:
        {
          const groupName = GROUP_NAME_FOR_CLIENT_TYPE[clientType];
          const group = groups.find((g) => g.name === groupName);
          if (!group) {
            throw new ErrorHandler(
              400,
              generateErrorMessage("NOT_FOUND", "Group"),
            );
          }
          const createLedgerInput: CreateOrUpdateLedgerInput = {
            companyId: DEFAULT_COMPANY_ID,
            groupId: group.id,
            name: ledgerName,
            currencyId: currencyId,
            creditPeriodInDays: creditPeriodInDays,
          };
          const createdLedger =
            await ledgerService.createLedger(createLedgerInput);
          ledgerIdToReturn = createdLedger.id;
        }
        break;
      case ClientType.INSURANCE:
        {
          const groupName = GROUP_NAME_FOR_CLIENT_TYPE[clientType];
          const group = groups.find((g) => g.name === groupName);
          if (!group) {
            throw new ErrorHandler(
              400,
              generateErrorMessage("NOT_FOUND", "Group"),
            );
          }
          const createLedgerInput: CreateOrUpdateLedgerInput = {
            companyId: DEFAULT_COMPANY_ID,
            groupId: group.id,
            name: ledgerName,
            currencyId: currencyId,
            creditPeriodInDays: creditPeriodInDays,
          };
          const createdLedger =
            await ledgerService.createLedger(createLedgerInput);
          ledgerIdToReturn = createdLedger.id;
        }
        break;
      case ClientType.PMS_DISTRIBUTOR:
        {
          const groupName = GROUP_NAME_FOR_CLIENT_TYPE[clientType];
          const group = groups.find((g) => g.name === groupName);
          if (!group) {
            throw new ErrorHandler(
              400,
              generateErrorMessage("NOT_FOUND", "Group"),
            );
          }
          const createLedgerInput: CreateOrUpdateLedgerInput = {
            companyId: DEFAULT_COMPANY_ID,
            groupId: group.id,
            name: ledgerName,
            currencyId: currencyId,
            creditPeriodInDays: creditPeriodInDays,
          };
          const createdLedger =
            await ledgerService.createLedger(createLedgerInput);
          ledgerIdToReturn = createdLedger.id;
        }
        break;
      case ClientType.INV_ITEM_SUPPLIER:
        {
          const groupName = GROUP_NAME_FOR_CLIENT_TYPE[clientType];
          const group = groups.find((g) => g.name === groupName);
          if (!group) {
            throw new ErrorHandler(
              400,
              generateErrorMessage("NOT_FOUND", "Group"),
            );
          }
          const createLedgerInput: CreateOrUpdateLedgerInput = {
            companyId: DEFAULT_COMPANY_ID,
            groupId: group.id,
            name: ledgerName,
            currencyId: currencyId,
            creditPeriodInDays: creditPeriodInDays,
          };
          const createdLedger =
            await ledgerService.createLedger(createLedgerInput);
          ledgerIdToReturn = createdLedger.id;
        }
        break;
      default:
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Client Type"),
        );
    }
  }
  logger.info(
    "exiting::createExternalClientLedgerMappingServiceValidation::service::validation",
  );
  return ledgerIdToReturn;
};
