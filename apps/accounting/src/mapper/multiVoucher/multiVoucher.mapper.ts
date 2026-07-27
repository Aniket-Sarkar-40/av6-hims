import { getAllCollectionCentersFromDb } from "@/repository/master/collectionCenter.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancelAndCreated } from "@/types/common.js";
import {
  MultiVoucherDetailsDTO,
  MultiVoucherDTO,
  MultiVoucherPdfDTO,
  MultiVoucherResponseForDTO,
} from "@/types/multiVoucher/multiVoucher.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { numberToWords } from "@repo/shared/utils/helper.utils.js";
import { customOmit, toIdValue } from "av6-utils";

export const toMultiVoucherDto = async (
  input: MultiVoucherResponseForDTO[],
): Promise<MultiVoucherDTO[]> => {
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

  const response: MultiVoucherDTO[] = await Promise.all(
    input.map(async (multiVoucher) => {
      const omittedData = customOmit<
        MultiVoucherResponseForDTO,
        | BaseModelAttrWoCancelAndCreated
        | "company"
        | "financialYear"
        | "multiVoucherDetails"
        | "ccId"
        | "companyId"
        | "financialYearId"
        | "voucherTypeId"
        | "ledgerId"
        | "createdBy"
        | "approvedBy"
      >(multiVoucher, [
        "isActive",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "createdBy",
        "approvedBy",
        "company",
        "financialYear",
        "multiVoucherDetails",
        "ccId",
        "companyId",
        "financialYearId",
        "voucherTypeId",
        "ledgerId",
      ]);

      const collectionCenter = collectionCenters.find(
        (cc) => cc.id === multiVoucher.ccId,
      );
      const voucherType = voucherTypes.find(
        (vt) => vt.id === multiVoucher.voucherTypeId,
      );
      const createdBy = multiVoucher.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            multiVoucher.createdBy,
          )
        : null;
      const approvedBy = multiVoucher.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            multiVoucher.approvedBy,
          )
        : null;
      const ledger = ledgers.find((l) => l.id === multiVoucher.ledgerId);

      const multiVoucherDetailsDto: MultiVoucherDetailsDTO[] =
        multiVoucher.multiVoucherDetails.map((md) => {
          const omittedData = customOmit(md, [
            "isActive",
            "createdBy",
            "createdAt",
            "updatedBy",
            "updatedAt",
            "deletedBy",
            "deletedAt",
            "ccId",
            "ledgerId",
          ]);
          const collectionCenter = collectionCenters.find(
            (cc) => cc.id === md.ccId,
          );
          const ledger = ledgers.find((l) => l.id === md.ledgerId);
          return {
            ...omittedData.rest,
            collectionCenter: toIdValue(collectionCenter, "colName"),
            ledger: toIdValue(ledger, "name"),
          };
        });
      return {
        ...omittedData.rest,
        createdBy: toIdValue(createdBy, "name"),
        approvedBy: toIdValue(approvedBy, "name"),
        collectionCenter: toIdValue(collectionCenter, "colName"),
        voucherType: toIdValue(voucherType, "name"),
        ledger: toIdValue(ledger, "name"),
        company: toIdValue(multiVoucher.company, "name"),
        financialYear: customOmit(multiVoucher.financialYear, [
          "isActive",
          "createdBy",
          "createdAt",
          "updatedBy",
          "updatedAt",
          "deletedBy",
          "deletedAt",
        ]).rest,
        multiVoucherDetails: multiVoucherDetailsDto,
      };
    }),
  );
  return response;
};

export const toMultiVoucherPdfDto = async (
  multiVoucher: MultiVoucherResponseForDTO,
): Promise<MultiVoucherPdfDTO> => {
  const collectionCenters = await getAllCollectionCentersFromDb();
  const voucherType = await commonGetService.getElementById<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    id: multiVoucher.voucherTypeId,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
    canNullReturnable: true,
  });
  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const omittedData = customOmit<
    MultiVoucherResponseForDTO,
    | BaseModelAttrWoCancelAndCreated
    | "company"
    | "financialYear"
    | "multiVoucherDetails"
    | "ccId"
    | "companyId"
    | "financialYearId"
    | "voucherTypeId"
    | "ledgerId"
    | "createdBy"
    | "approvedBy"
  >(multiVoucher, [
    "isActive",
    "updatedBy",
    "updatedAt",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "approvedBy",
    "company",
    "financialYear",
    "multiVoucherDetails",
    "ccId",
    "companyId",
    "financialYearId",
    "voucherTypeId",
    "ledgerId",
  ]);

  const collectionCenter = collectionCenters.find(
    (cc) => cc.id === multiVoucher.ccId,
  );
  const createdBy = multiVoucher.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(multiVoucher.createdBy)
    : null;
  const approvedBy = multiVoucher.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(multiVoucher.approvedBy)
    : null;
  const ledger = ledgers.find((l) => l.id === multiVoucher.ledgerId);
  const drCr = multiVoucher.drCr;

  let index = 0;

  const multiVoucherDetailsDto: MultiVoucherDetailsDTO[] =
    multiVoucher.multiVoucherDetails.map((md) => {
      const omittedData = customOmit(md, [
        "isActive",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "ccId",
        "ledgerId",
        "amount",
      ]);
      index++;
      const collectionCenter = collectionCenters.find(
        (cc) => cc.id === md.ccId,
      );
      const ledger = ledgers.find((l) => l.id === md.ledgerId);
      const amount = drCr !== md.drCr ? md.amount : md.amount.mul(-1);

      return {
        ...omittedData.rest,
        collectionCenter: toIdValue(collectionCenter, "colName"),
        ledger: toIdValue(ledger, "name"),
        amount: amount,
        index: index,
      };
    });

  const amountInWords = multiVoucher.amount
    ? numberToWords.convert(multiVoucher.amount.toNumber())
    : "";

  const formattedAmountInWords =
    amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1);

  return {
    ...omittedData.rest,
    createdBy: toIdValue(createdBy, "name"),
    approvedBy: toIdValue(approvedBy, "name"),
    collectionCenter: toIdValue(collectionCenter, "colName"),
    voucherType: toIdValue(voucherType, "name"),
    ledger: toIdValue(ledger, "name"),
    company: toIdValue(multiVoucher.company, "name"),
    financialYear: customOmit(multiVoucher.financialYear, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
    ]).rest,
    multiVoucherDetails: multiVoucherDetailsDto,
    amountInWords: formattedAmountInWords,
  };
};
