import { getAll } from "@/repository/common.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { IdValue } from "@/types/global.js";
import {
  CreateOrUpdateLedgerExcelInput,
  CreateOrUpdateLedgerInput,
  FetchLedgerForExternalMappingInput,
  LedgerDTO,
  LedgerDTOForTrialBalance,
  LedgerExcelRow,
  LedgerResponse,
} from "@/types/master/ledger.js";
import {
  GST_TYPES,
  LEDGER_TYPES,
  parseEnum,
  parseOptionalBoolean,
  parseOptionalString,
} from "@/utils/groupAndLedgerExcelImport.utils.js";
import { GROUP_NAME_FOR_CLIENT_TYPE } from "@/validations/service/mapping/clientLedgerMapping.service.validation.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import {
  ClientLedgerMapping,
  Ledger,
  LedgerExcel,
} from "@repo/db/generated/prisma/client";
import { LedgerGstType, LedgerType } from "@repo/db/generated/prisma/enums.js";
import { DEFAULT_COMPANY_ID } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { customOmit, toIdValue } from "av6-utils";

export const mapRowToLedgerExcelCreateInput = (
  row: LedgerExcelRow,
  rowNo: number,
): CreateOrUpdateLedgerExcelInput => {
  const name = parseOptionalString(row.Name);
  if (!name) {
    throw new ErrorHandler(400, generateErrorMessage("FIELD_REQUIRED", "Name"));
  }

  const groupName = parseOptionalString(row["Group Name"]);
  if (!groupName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Group Name"),
    );
  }

  return {
    rowNo,
    name,
    groupName,
    alias: parseOptionalString(row.Alias),
    ledgerType:
      parseEnum<LedgerType>(row["Ledger Type"], LEDGER_TYPES, "Ledger Type") ??
      "GENERAL",
    isBankAccount: parseOptionalBoolean(row["Bank Account"]) ?? false,
    isCashAccount: parseOptionalBoolean(row["Cash Account"]) ?? false,
    bankName: parseOptionalString(row["Bank Name"]),
    bankIfsc: parseOptionalString(row["Bank IFSC"]),
    branchName: parseOptionalString(row["Branch Name"]),
    bankAccountNo: parseOptionalString(row["Bank Account No"]),
    upiId: parseOptionalString(row["UPI Id"]),
    contactName: parseOptionalString(row["Contact Name"]),
    phone: parseOptionalString(row.Phone),
    email: parseOptionalString(row.Email),
    address: parseOptionalString(row.Address),
    gstType:
      parseEnum<LedgerGstType>(row["TIN Type"], GST_TYPES, "TIN Type") ?? "NA",
    gstin: parseOptionalString(row["TIN Number"]),
    placeOfSupplyStateName: parseOptionalString(row["Place of Supply State"]),
    currencyCode: parseOptionalString(row["Currency Code"]),
  };
};

export const buildLedgerInputFromExcel = async (params: {
  item: LedgerExcel;
  companyId: number;
  stateMap: Map<string, number>;
}): Promise<CreateOrUpdateLedgerInput> => {
  const { item, companyId, stateMap } = params;

  const allGroups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const group = allGroups.find(
    (g) =>
      g.name.toLowerCase() === item.groupName.toLowerCase() &&
      g.companyId === companyId,
  );
  if (!group) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Group"));
  }

  const allLedgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const existingLedger = allLedgers.find(
    (l) =>
      l.name.toLowerCase() === item.name.toLowerCase() &&
      l.companyId === companyId,
  );
  if (existingLedger) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", `Ledger with name ${item.name}`),
    );
  }

  if (item.isBankAccount && item.isCashAccount) {
    throw new ErrorHandler(
      400,
      "Bank Account and Cash Account cannot be true at the same time",
    );
  }

  if (item.isBankAccount) {
    if (!item.bankName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Bank Name"),
      );
    }
    if (!item.bankAccountNo) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Bank Account No"),
      );
    }
  }

  const gstTypesRequiringGstin: LedgerGstType[] = [
    "REGISTERED",
    "COMPOSITION",
    "SEZ",
  ];
  if (gstTypesRequiringGstin.includes(item.gstType)) {
    if (!item.gstin) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "TIN Number"),
      );
    }
    if (!item.placeOfSupplyStateName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Place of Supply State"),
      );
    }
  }

  let placeOfSupplyStateId: number | null = null;
  if (item.placeOfSupplyStateName) {
    const stateId = stateMap.get(item.placeOfSupplyStateName);
    if (!stateId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Place of Supply State"),
      );
    }
    placeOfSupplyStateId = stateId;
  }

  let currencyId: number | null = null;
  if (item.currencyCode) {
    const currencies = await currencyService.getAllCurrency();
    const currency = currencies.find((c) => c.code === item.currencyCode);
    if (!currency) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Currency"),
      );
    }
    currencyId = currency.id;
  }

  if (item.isBankAccount && !currencyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Currency Code"),
    );
  }

  return {
    companyId,
    groupId: group.id,
    name: item.name,
    alias: item.alias,
    ledgerType: item.ledgerType,
    isBankAccount: item.isBankAccount,
    isCashAccount: item.isCashAccount,
    isReserved: false,
    bankName: item.bankName,
    bankIfsc: item.bankIfsc,
    branchName: item.branchName,
    bankAccountNo: item.bankAccountNo,
    upiId: item.upiId,
    contactName: item.contactName,
    phone: item.phone,
    email: item.email,
    address: item.address,
    gstType: item.gstType,
    gstin: item.gstin,
    placeOfSupplyStateId,
    currencyId,
  };
};

export const toLedgerDto = async (
  input: LedgerResponse[],
): Promise<LedgerDTO[]> => {
  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const currencies = await currencyService.getAllCurrency();
  const response: LedgerDTO[] = input.map((ledger) => {
    const currency = currencies.find((c) => c.id === ledger.currencyId);
    return {
      ...customOmit(ledger, [
        "company",
        "companyId",
        "groupId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "deletedBy",
        "isActive",
      ]).rest,
      company: toIdValue(ledger.company, "name"),
      group: toIdValue(
        groups.find((g) => g.id === ledger.groupId),
        "name",
      ),
      currency: toIdValue(currency, "code"),
    };
  });
  return response;
};

export const toLedgerDtoForTrialBalance = async (
  input: Ledger[],
): Promise<LedgerDTOForTrialBalance[]> => {
  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const response: LedgerDTOForTrialBalance[] = input.map((ledger) => {
    const group = groups.find((g) => g.id === ledger.groupId);

    return {
      ...customOmit(ledger, [
        "companyId",
        "groupId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "deletedBy",
        "isActive",
      ]).rest,

      group: toIdValue(group, "name"),
      parentGroup: toIdValue(
        groups.find((g) => g.id === group?.parentId),
        "name",
      ),
    };
  });
  return response;
};

export const toFetchLedgerForExternalMappingDto = async (
  input: FetchLedgerForExternalMappingInput,
): Promise<IdValue[]> => {
  const { clientType } = input;
  const groupName =
    GROUP_NAME_FOR_CLIENT_TYPE[
      clientType as keyof typeof GROUP_NAME_FOR_CLIENT_TYPE
    ];

  const allLedgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });
  const ledgers = allLedgers.filter(
    (ledger) => ledger.companyId === DEFAULT_COMPANY_ID,
  );

  const allGroups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });
  const groups = allGroups.filter(
    (group) => group.companyId === DEFAULT_COMPANY_ID,
  );

  const group = groups.find((group) => group.name === groupName);
  if (!group) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Group"));
  }

  const mappedLedgers = (await getAll<"ClientLedgerMapping">({
    model: "ClientLedgerMapping",
    useActiveFlag: true,
  })) as ClientLedgerMapping[];

  const filteredLedgers = ledgers
    .filter((ledger) => ledger.groupId === group.id)
    .filter(
      (ledger) =>
        !mappedLedgers.some(
          (mappedLedger) => mappedLedger.ledgerId === ledger.id,
        ),
    );

  return filteredLedgers
    .map((ledger) => toIdValue(ledger, "name"))
    .filter((ledger) => ledger !== null);
};
