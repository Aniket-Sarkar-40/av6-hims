import { requestStorage } from "@/config/requestContext.js";
import {
  CreateOrUpdateMultiVoucherInput,
  PreparedVoucherInputForMultiVoucher,
} from "@/types/multiVoucher/multiVoucher.js";
import { CreateOrUpdateVoucherLineInput } from "@/types/voucher/voucher.js";
import { applyRound } from "av6-utils";
import { VoucherLineSeed } from "./externalVoucherPost.utils.js";
import { commonGetService } from "@/services/common.service.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  DrCr,
  VoucherStatus,
  VoucherTypeNature,
} from "@repo/db/generated/prisma/enums.js";
import { DEFAULT_COMPANY_ID } from "@repo/shared";
import { Prisma } from "@repo/db/generated/prisma/client";

export const prepareVoucherInputForMultiVoucher = async (
  input: CreateOrUpdateMultiVoucherInput,
): Promise<PreparedVoucherInputForMultiVoucher[]> => {
  const {
    companyId,
    financialYearId,
    voucherTypeId,
    voucherDate,
    ledgerId,
    drCr,
    multiVoucherDetails,
  } = input;

  const common = {
    companyId,
    financialYearId,
    voucherTypeId,
    voucherDate,
  };

  let effectVoucherTypeId = voucherTypeId;

  const vouchers: PreparedVoucherInputForMultiVoucher[] = [];
  let index = 0;
  for (const multiVoucherDetail of multiVoucherDetails) {
    const voucherLines: VoucherLineSeed[] = [];
    if (multiVoucherDetail.drCr === drCr) {
      const allVoucherTypes =
        await commonGetService.getAllElements<"VoucherType">({
          cacheCode: "VOUCHER_TYPE",
          canNullReturnable: true,
          modelName: "VoucherType",
          shortCode: "VOUCHER_TYPE",
          useActiveFlag: true,
        });

      const voucherTypes = allVoucherTypes.filter(
        (voucherType) => voucherType.companyId === DEFAULT_COMPANY_ID,
      );
      const voucherType = voucherTypes.find(
        (voucherType) => voucherType.nature === VoucherTypeNature.JOURNAL,
      );
      if (!voucherType) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Voucher Type"),
        );
      }
      effectVoucherTypeId = voucherType.id;
    }

    // common line for all multi voucher details
    voucherLines.push({
      ledgerId,
      drCr:
        multiVoucherDetail.drCr === drCr
          ? drCr === DrCr.DR
            ? DrCr.CR
            : DrCr.DR
          : drCr,
      amount: multiVoucherDetail.amount,
      transactionType: multiVoucherDetail.transactionType,
      instrumentNo: multiVoucherDetail.instrumentNo,
      instrumentDate: multiVoucherDetail.instrumentDate,
    });

    voucherLines.push({
      ledgerId: multiVoucherDetail.ledgerId,
      drCr: multiVoucherDetail.drCr,
      amount: multiVoucherDetail.amount,
    });
    const voucher: PreparedVoucherInputForMultiVoucher =
      buildVoucherForMultiVoucher({
        ...common,
        voucherTypeId: effectVoucherTypeId,
        id: multiVoucherDetail.voucherId ?? undefined,
        lineNo: multiVoucherDetail.lineNo ?? index + 1,
        ccId: multiVoucherDetail.ccId,
        voucherLines,
        narration: multiVoucherDetail.narration,
      });
    if (voucher.totalCredit === 0 && voucher.totalDebit === 0) continue;
    vouchers.push(voucher);
    index++;
  }
  return vouchers;
};

const buildVoucherForMultiVoucher = (
  input: Omit<
    Prisma.VoucherCreateManyInput,
    | "totalDebit"
    | "totalCredit"
    | "voucherLines"
    | "voucherNo"
    | "status"
    | "createdBy"
    | "isActive"
    | "updatedBy"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
    | "deletedBy"
  > & {
    lineNo: number;
    createdBy?: number;
    status?: VoucherStatus;
    voucherLines: VoucherLineSeed[];
  },
): PreparedVoucherInputForMultiVoucher => {
  const settings = requestStorage.getStore()?.settings;
  if (!settings) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Settings"));
  }
  const precision = settings.roundingPrecision;
  const method = settings.roundingMethod;

  const voucherLines: CreateOrUpdateVoucherLineInput[] = input.voucherLines.map(
    (line, index) => ({
      ...line,
      lineNo: index + 1,
    }),
  );

  const totalDebit = voucherLines
    .filter((line) => line.drCr === DrCr.DR)
    .reduce((sum, line) => sum + Number(line.amount || 0), 0);

  const totalCredit = voucherLines
    .filter((line) => line.drCr === DrCr.CR)
    .reduce((sum, line) => sum + Number(line.amount || 0), 0);

  const totalDebitRounded = applyRound(totalDebit, method, precision);
  const totalCreditRounded = applyRound(totalCredit, method, precision);

  if (totalDebitRounded !== totalCreditRounded) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        `Total Debit: ${totalDebitRounded}`,
        `Total Credit: ${totalCreditRounded}`,
      ),
    );
  }

  return {
    ...input,
    createdBy: input.createdBy ?? undefined,
    status: input.status ?? VoucherStatus.POSTED,
    totalDebit: totalDebitRounded,
    totalCredit: totalCreditRounded,
    voucherLines,
  };
};
