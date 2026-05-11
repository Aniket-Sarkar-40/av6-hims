import { getAllCollectionCentersFromDb } from "@/repository/master/collectionCenter.repository.js";
import { commonGetService } from "@/services/common.service.js";
import {
  CreateOrUpdateVoucherEntryExcelInput,
  LedgerColumnMeta,
  VoucherEntryExcelRow,
} from "@/types/batch/batch.js";
import { BaseModelAttrWoCancelAndCreated } from "@/types/common.js";
import {
  BillAllocationDTO,
  CostCenterAllocationDTO,
  VoucherDTO,
  VoucherLineDTO,
  VoucherResponseForDTO,
} from "@/types/voucher/voucher.js";
import { extractOtherLedgersWithMeta } from "@/utils/voucherExcelImport.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import dayjs from "dayjs";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import { VoucherStatus } from "@repo/db/generated/prisma/enums.js";

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
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(voucher.createdBy)
        : null;
      const approvedBy = voucher.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(voucher.approvedBy)
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

          return {
            ...omittedData.rest,
            ledger: toIdValue(ledger, "name"),
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
        ? await currencyService.getCurrencyById(voucher.currencyId)
        : null;

      return {
        ...omittedData.rest,
        createdBy: toIdValue(createdBy, "name"),
        approvedBy: toIdValue(approvedBy, "name"),
        company: toIdValue(voucher.company, "name"),
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
        voucherType: toIdValue(voucherType, "name"),
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
  const otherLedgers = extractOtherLedgersWithMeta(row, meta);

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
