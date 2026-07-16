import { coreRequests } from "@/client/core/request.js";
import { getAllCollectionCentersFromDb } from "@/repository/master/collectionCenter.repository.js";
import { commonGetService } from "@/services/common.service.js";
import {
  CreateOrUpdateVoucherEntryExcelInput,
  LedgerColumnMeta,
  OtherLedger,
  VoucherEntryExcelRow,
} from "@/types/batch/batch.js";
import { BaseModelAttrWoCancelAndCreated } from "@/types/common.js";
import {
  BillAllocationDTO,
  CostCenterAllocationDTO,
  UsedChequeNumberDTO,
  UsedChequeNumberResponse,
  VoucherDTO,
  VoucherLineDTO,
  VoucherLinePdfDTO,
  VoucherPdfDTO,
  VoucherResponseForDTO,
} from "@/types/voucher/voucher.js";
import { numberToWords } from "@/utils/helper.utils.js";
import { extractOtherLedgersWithMeta } from "@/utils/voucherExcelImport.utils.js";
import { getTopLedger } from "@/utils/voucherPdf.utils.js";
import { VoucherStatus } from "@repo/db/generated/prisma/enums.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import dayjs from "dayjs";

export const toVoucherDTO = async (
  input: VoucherResponseForDTO[]
): Promise<VoucherDTO[]> => {
  const collectionCenters = await getAllCollectionCentersFromDb();
  const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });
  const costCenters = await commonGetService.getAllElements<"CostCenter">({
    cacheCode: "COST_CENTER",
    canNullReturnable: true,
    modelName: "CostCenter",
    shortCode: "COST_CENTER",
    useActiveFlag: true,
  });

  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const response: VoucherDTO[] = await Promise.all(
    input.map(async (voucher) => {
      const omittedData = customOmit<
        VoucherResponseForDTO,
        | BaseModelAttrWoCancelAndCreated
        | "company"
        | "voucherLines"
        | "financialYear"
        | "companyId"
        | "ccId"
        | "voucherTypeId"
        | "financialYearId"
        | "createdBy"
        | "currencyId"
      >(voucher, [
        "createdBy",
        "isActive",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "company",
        "voucherLines",
        "financialYear",
        "companyId",
        "ccId",
        "voucherTypeId",
        "financialYearId",
        "currencyId",
      ]);

      const collectionCenter = collectionCenters.find(
        (cc) => cc.id === voucher.ccId
      );
      const voucherType = voucherTypes.find(
        (vt) => vt.id === voucher.voucherTypeId
      );
      const createdBy = voucher.createdBy
        ? await coreRequests.getEmployeeCache(voucher.createdBy)
        : null;
      const approvedBy = voucher.approvedBy
        ? await coreRequests.getEmployeeCache(voucher.approvedBy)
        : null;
      const voucherLineDto: VoucherLineDTO[] = voucher.voucherLines.map(
        (vl) => {
          const omittedData = customOmit(vl, [
            "isActive",
            "createdBy",
            "createdAt",
            "updatedBy",
            "updatedAt",
            "deletedBy",
            "deletedAt",
            "ledgerId",
          ]);
          const ledger = ledgers.find((l) => l.id === vl.ledgerId);
          const group = groups.find((g) => g.id === ledger?.groupId);
          return {
            ...omittedData.rest,
            ledger: ledger
              ? {
                  id: ledger.id,
                  value: ledger.name,
                  groupName: group?.name ?? null,
                  nature: group?.nature ?? null,
                  isBankAccount: ledger.isBankAccount,
                  isCashAccount: ledger.isCashAccount,
                }
              : null,
          };
        }
      );

      const billAllocationsDto: BillAllocationDTO[] =
        voucher.billAllocations.map((ba) => {
          const omittedData = customOmit(ba, [
            "isActive",
            "createdBy",
            "createdAt",
            "updatedBy",
            "updatedAt",
            "deletedBy",
            "deletedAt",
            "companyId",
            "financialYearId",
            "partyLedgerId",
          ]);
          const partyLedger = ledgers.find((l) => l.id === ba.partyLedgerId);
          return {
            ...omittedData.rest,
            partyLedger: toIdValue(partyLedger, "name"),
          };
        });

      const costCenterAllocationsDto: CostCenterAllocationDTO[] =
        voucher.costCenterAllocations.map((ca) => {
          const omittedData = customOmit(ca, [
            "isActive",
            "createdBy",
            "createdAt",
            "updatedBy",
            "updatedAt",
            "deletedBy",
            "deletedAt",
            "companyId",
            "costCenterId",
          ]);
          const costCenter = costCenters.find(
            (cc) => cc.id === ca.costCenterId
          );
          return {
            ...omittedData.rest,
            costCenter: toIdValue(costCenter, "name"),
          };
        });

      const currency = voucher.currencyId
        ? await coreRequests.getCurrencyById(voucher.currencyId)
        : null;

      return {
        ...omittedData.rest,
        createdBy: toIdValue(createdBy, "name"),
        approvedBy: toIdValue(approvedBy, "name"),
        company: {
          id: voucher.company.id,
          name: voucher.company.name,
          currencyId: voucher.company.currencyId,
        },
        financialYear: customOmit(voucher.financialYear, [
          "isActive",
          "createdBy",
          "createdAt",
          "updatedBy",
          "updatedAt",
          "deletedBy",
          "deletedAt",
        ]).rest,
        collectionCenter: toIdValue(collectionCenter, "colName"),
        voucherType: voucherType
          ? {
              id: voucherType.id,
              value: voucherType.name,
              nature: voucherType.nature,
            }
          : null,
        voucherLines: voucherLineDto,
        billAllocations: billAllocationsDto,
        costCenterAllocations: costCenterAllocationsDto,
        currency: toIdValue(currency, "code"),
      };
    })
  );

  return response;
};

export function mapRowToVoucherExcelCreateInput(
  row: VoucherEntryExcelRow,
  rowNo: number,
  meta: LedgerColumnMeta[]
): CreateOrUpdateVoucherEntryExcelInput {
  const otherLedgers: OtherLedger[] = extractOtherLedgersWithMeta(row, meta);

  return {
    rowNo,
    voucherDate: dayjs(row["Voucher Date"]).format("YYYY-MM-DD"),
    voucherType: row["Voucher Type"].trim(),
    refType: row["Ref Type"]?.trim() ?? null,
    subRefType: row["Sub Ref Type"]?.trim() ?? null,
    refNo: row["Ref No"]?.trim() ?? null,
    narration: row["Narration"].trim(),
    partyLedger: row["Party Ledger"]?.trim() ?? null,
    partyLedgerGroup: row["Party Ledger Group"]?.trim() ?? null,
    otherLedgers, // JSON
    status: row["Status"] as VoucherStatus,
  };
}

export const toUsedChequeNumberDTO = async (
  input: UsedChequeNumberResponse[]
): Promise<UsedChequeNumberDTO[]> => {
  const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });
  const response: UsedChequeNumberDTO[] = input.map((usedChequeNumber) => {
    const voucherType = voucherTypes.find(
      (vt) => vt.id === usedChequeNumber.voucherLine.voucher.voucherTypeId
    );
    return {
      id: usedChequeNumber.id,
      chequeNo: usedChequeNumber.chequeNo.toString(),
      isUsed: usedChequeNumber.isUsed,
      voucherId: usedChequeNumber.voucherLine.voucher.id,
      voucherLineId: usedChequeNumber.voucherLine.id,
      voucherNo: usedChequeNumber.voucherLine.voucher.voucherNo,
      voucherDate: usedChequeNumber.voucherLine.voucher.voucherDate,
      voucherType: toIdValue(voucherType, "name"),
    };
  });
  return response;
};

export const toVoucherPdfDTO = async (
  voucher: VoucherResponseForDTO
): Promise<VoucherPdfDTO> => {
  const collectionCenters = await getAllCollectionCentersFromDb();
  const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });

  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const omittedData = customOmit<
    VoucherResponseForDTO,
    | BaseModelAttrWoCancelAndCreated
    | "company"
    | "voucherLines"
    | "financialYear"
    | "companyId"
    | "ccId"
    | "voucherTypeId"
    | "financialYearId"
    | "createdBy"
    | "currencyId"
  >(voucher, [
    "createdBy",
    "isActive",
    "updatedBy",
    "updatedAt",
    "deletedBy",
    "deletedAt",
    "company",
    "voucherLines",
    "financialYear",
    "companyId",
    "ccId",
    "voucherTypeId",
    "financialYearId",
    "currencyId",
  ]);

  const collectionCenter = collectionCenters.find(
    (cc) => cc.id === voucher.ccId
  );
  const voucherType = voucherTypes.find(
    (vt) => vt.id === voucher.voucherTypeId
  );
  const createdBy = voucher.createdBy
    ? await coreRequests.getEmployeeCache(voucher.createdBy)
    : null;
  const approvedBy = voucher.approvedBy
    ? await coreRequests.getEmployeeCache(voucher.approvedBy)
    : null;
  const allLines = voucher.voucherLines;
  const topLedgerData = getTopLedger(
    voucherType!.nature,
    allLines,
    ledgers,
    groups
  );
  if (!topLedgerData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Top Ledger")
    );
  }
  const topLine = topLedgerData.line;
  const topLedger = topLedgerData.ledger;
  const rowLines = allLines.filter((line) => line.id !== topLine?.id);
  const topLedgerEntityLabel =
    voucherType?.nature === "CREDIT_NOTE" ||
    voucherType?.nature === "DEBIT_NOTE"
      ? "Party A/c Name"
      : "Account";
  const transactionLine =
    allLines.find(
      (line) => line.transactionType || line.instrumentNo || line.instrumentDate
    ) ?? null;
  const transactionType = transactionLine?.transactionType ?? null;
  const instrumentNo = transactionLine?.instrumentNo ?? null;
  const instrumentDate = transactionLine?.instrumentDate ?? null;
  const topDrCr = topLine?.drCr ?? null;
  const voucherLineDto: VoucherLinePdfDTO[] = rowLines.map((vl, index) => {
    const omittedLine = customOmit(vl, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
      "ledgerId",
      "amount",
    ]);

    const ledger = ledgers.find((l) => l.id === vl.ledgerId);
    const group = groups.find((g) => g.id === ledger?.groupId);
    const amount = topDrCr !== vl.drCr ? vl.amount : vl.amount.mul(-1);

    return {
      ...omittedLine.rest,
      ledger: ledger
        ? {
            id: ledger.id,
            value: ledger.name,
            groupName: group?.name ?? null,
            nature: group?.nature ?? null,
            isBankAccount: ledger.isBankAccount,
            isCashAccount: ledger.isCashAccount,
          }
        : null,
      index: index + 1,
      amount,
    };
  });
  const currency = voucher.currencyId
    ? await coreRequests.getCurrencyById(voucher.currencyId)
    : null;
  const amountInWords = topLine.amount
    ? numberToWords.convert(topLine.amount.toNumber())
    : "";
  return {
    ...omittedData.rest,
    createdBy: toIdValue(createdBy, "name"),
    approvedBy: toIdValue(approvedBy, "name"),
    company: {
      id: voucher.company.id,
      name: voucher.company.name,
      currencyId: voucher.company.currencyId,
    },
    financialYear: customOmit(voucher.financialYear, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
    ]).rest,
    collectionCenter: toIdValue(collectionCenter, "colName"),
    voucherType: voucherType
      ? {
          id: voucherType.id,
          value: voucherType.name,
          nature: voucherType.nature,
        }
      : null,
    topLedger: {
      name: topLedger?.name ?? "",
      label: topLedgerEntityLabel,
      amount: topLine.amount.toNumber(),
    },
    transactionType,
    instrumentNo,
    instrumentDate,
    voucherLines: voucherLineDto,
    currency: toIdValue(currency, "code"),
    amountInWords,
  };
};

export const toVoucherJournalPdfDTO = async (
  voucher: VoucherResponseForDTO
): Promise<VoucherPdfDTO> => {
  const collectionCenters = await getAllCollectionCentersFromDb();
  const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });

  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });
  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  const omittedData = customOmit<
    VoucherResponseForDTO,
    | BaseModelAttrWoCancelAndCreated
    | "company"
    | "voucherLines"
    | "financialYear"
    | "companyId"
    | "ccId"
    | "voucherTypeId"
    | "financialYearId"
    | "createdBy"
    | "currencyId"
  >(voucher, [
    "createdBy",
    "isActive",
    "updatedBy",
    "updatedAt",
    "deletedBy",
    "deletedAt",
    "company",
    "voucherLines",
    "financialYear",
    "companyId",
    "ccId",
    "voucherTypeId",
    "financialYearId",
    "currencyId",
  ]);

  const collectionCenter = collectionCenters.find(
    (cc) => cc.id === voucher.ccId
  );
  const voucherType = voucherTypes.find(
    (vt) => vt.id === voucher.voucherTypeId
  );
  const createdBy = voucher.createdBy
    ? await coreRequests.getEmployeeCache(voucher.createdBy)
    : null;
  const approvedBy = voucher.approvedBy
    ? await coreRequests.getEmployeeCache(voucher.approvedBy)
    : null;
  const byLines = voucher.voucherLines.filter((line) => line.drCr === "DR");
  const toLines = voucher.voucherLines.filter((line) => line.drCr === "CR");
  const sortedLines = [...byLines, ...toLines];
  const voucherLineDto: VoucherLinePdfDTO[] = sortedLines.map((vl, index) => {
    const omittedLine = customOmit(vl, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
      "ledgerId",
    ]);

    const ledger = ledgers.find((l) => l.id === vl.ledgerId);
    const group = groups.find((g) => g.id === ledger?.groupId);
    return {
      ...omittedLine.rest,
      ledger: ledger
        ? {
            id: ledger.id,
            value: ledger.name,
            groupName: group?.name ?? null,
            nature: group?.nature ?? null,
            isBankAccount: ledger.isBankAccount,
            isCashAccount: ledger.isCashAccount,
          }
        : null,
      index: index + 1,
      byTo: vl.drCr === "DR" ? "BY" : "TO",
    };
  });

  const currency = voucher.currencyId
    ? await coreRequests.getCurrencyById(voucher.currencyId)
    : null;

  const netAmount =
    voucher.totalDebit &&
    voucher.currencyConversionRate &&
    !voucher.currencyConversionRate.isZero()
      ? voucher.totalDebit.div(voucher.currencyConversionRate)
      : voucher.totalDebit;

  const amountInWords = netAmount
    ? numberToWords.convert(netAmount.toNumber())
    : "";
  return {
    ...omittedData.rest,
    createdBy: toIdValue(createdBy, "name"),
    approvedBy: toIdValue(approvedBy, "name"),
    company: {
      id: voucher.company.id,
      name: voucher.company.name,
      currencyId: voucher.company.currencyId,
    },
    financialYear: customOmit(voucher.financialYear, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
    ]).rest,
    collectionCenter: toIdValue(collectionCenter, "colName"),
    voucherType: voucherType
      ? {
          id: voucherType.id,
          value: voucherType.name,
          nature: voucherType.nature,
        }
      : null,
    transactionType: null,
    instrumentNo: null,
    instrumentDate: null,
    voucherLines: voucherLineDto,
    currency: toIdValue(currency, "code"),
    amountInWords,
    topLedger: null,
  };
};
