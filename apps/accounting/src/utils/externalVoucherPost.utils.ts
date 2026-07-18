import { requestStorage } from "@/config/requestContext.js";
import { getAll } from "@/repository/common.repository.js";
import {
  createClientLedgerMapping,
  getClientLedgerMappingByClientIdAndClientType,
} from "@/repository/mapping/clientLedgerMapping.repository.js";
import { getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb } from "@/repository/master/companyFinancialYear.repository.js";
import { createLedgerInDb } from "@/repository/master/ledger.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { AccountingIntegrationConfigResponse } from "@/types/integrationConfig/accountingIntegrationConfig.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import {
  CreateOrUpdateVoucherLineInput,
  ExternalPostVoucherInput,
  paymentInput,
  PaymentMode,
  preparedVoucherInput,
} from "@/types/voucher/voucher.js";
import { validateIdClientMaster } from "@/validations/service/clientMaster/corporate.service.validation.js";
import { validateIdInsuranceMaster } from "@/validations/service/clientMaster/insurance.service.validation.js";
import { validateIdPmsDistributor } from "@/validations/service/pmsDistributor/pmsDistributor.service.validation.js";

import { validateIdInventorySupplier } from "@/validations/service/invSupplier/inventorySupplier.service.validation.js";
import { getCashAndBankHeadByIdFromDb } from "@/repository/master/cashAndBankHead.repository.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  ClientType,
  ConfigSubRefType,
  DrCr,
  LedgerType,
  VoucherReferenceType,
  VoucherStatus,
} from "@repo/db/generated/prisma/enums.js";
import {
  AccountingIntegrationConfigDetails,
  Group,
  Ledger,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { getNestedValue, renderTemplate } from "av6-core-v2";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import { addToCache } from "@repo/platform/cache/redis.utils.js";
import { applyRound } from "av6-utils";
import { DEFAULT_COMPANY_ID } from "@repo/shared";

/**Constant for the cash and bank group names */
const CASH_BANK_GROUP_NAMES = {
  CASH: "Cash-in-Hand",
  BANK: "Bank Accounts",
};
const ledgerCacheKey = getRedisKey("LEDGER", "all");

/** Helper function to prepare the external voucher post input */
export const prepareExternalVoucherPostInput = async (
  input: ExternalPostVoucherInput,
): Promise<{
  preparedVoucherInputs: preparedVoucherInput[];
  isCurrencyConversionRequired: boolean;
}> => {
  logger.info("entering::prepareExternalVoucherPostInput::utils");

  const companyId = DEFAULT_COMPANY_ID;
  const {
    ccId,
    refType,
    refSubType,
    refNo,
    refDate,
    refId,
    pId,
    createdBy,
    currencyId,
    currencyConversionRate,
  } = input;

  const financialYear =
    await getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb(companyId);
  if (!financialYear) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Financial Year"),
    );
  }

  let isCurrencyConversionRequired = true;
  const grnRefTypeForCurrencyConversion: VoucherReferenceType[] = [
    VoucherReferenceType.PHARMACY_GRN,
    VoucherReferenceType.PHARMACY_GRN_RETURN,
    VoucherReferenceType.INVENTORY_GRN,
    VoucherReferenceType.INVENTORY_GRN_RETURN,
  ];
  if (grnRefTypeForCurrencyConversion.includes(refType)) {
    isCurrencyConversionRequired = false;
  }
  const common = {
    ccId,
    companyId,
    financialYearId: financialYear.id,
    voucherDate: refDate,
    refNo,
    refId,
    pId,
    refType,
    subRefType: refSubType,
    createdBy,
    currencyId,
    currencyConversionRate,
  };

  const allLedgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const ledgerTypes = allLedgers.filter(
    (ledger) => ledger.companyId === companyId,
  ) as Ledger[];

  const voucherConfigs = (await getAll({
    model: "AccountingIntegrationConfig",
    where: {
      refType: refType,
      subRefType: refSubType,
    },
    args: {
      include: {
        accountingIntegrationConfigDetails: {
          where: {
            isActive: true,
          },
        },
      },
    },
    useActiveFlag: true,
  })) as AccountingIntegrationConfigResponse[];

  const preparedVoucherInputs: preparedVoucherInput[] = [];

  for (const voucherConfig of voucherConfigs) {
    const voucherLines: VoucherLineSeed[] = [];

    for (const accountingIntegrationConfigDetail of voucherConfig.accountingIntegrationConfigDetails ??
      []) {
      if (accountingIntegrationConfigDetail.type === "FLAT") {
        const ledgerId: number = await getFlatLedgerIdByConfig({
          accountingIntegrationConfigDetail,
          input,
          ledgerTypes,
          companyId,
          createdBy,
        });

        const amount = getNestedValue<number>(
          input,
          accountingIntegrationConfigDetail.amountKey,
        );
        if (amount === null || amount === undefined || amount < 0) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Amount"),
          );
        }
        voucherLines.push({
          ledgerId,
          drCr: accountingIntegrationConfigDetail.policy,
          amount: amount,
        });
      } else {
        const masterValues = getNestedValue<unknown[]>(
          input,
          accountingIntegrationConfigDetail.masterKey,
        );
        if (!masterValues || masterValues.length === 0) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Master Values"),
          );
        }
        for (const masterValue of masterValues) {
          const ledgerId: number = await getFlatLedgerIdByConfig({
            accountingIntegrationConfigDetail,
            input: masterValue,
            ledgerTypes,
            companyId,
            createdBy,
          });

          const amount = getNestedValue<number>(
            masterValue,
            accountingIntegrationConfigDetail.amountKey,
          );
          if (amount === null || amount === undefined || amount < 0) {
            throw new ErrorHandler(
              400,
              generateErrorMessage("NOT_FOUND", "Amount"),
            );
          }
          voucherLines.push({
            ledgerId,
            drCr: accountingIntegrationConfigDetail.policy,
            amount: amount,
          });
        }
      }
    }
    const narrationText =
      renderTemplate(voucherConfig.narrationText, input) ?? null;
    const narration = input.remarks
      ? `${narrationText}(${input.remarks}).`
      : narrationText;
    const voucher = buildVoucher({
      ...common,
      voucherTypeId: voucherConfig.voucherTypeId,
      voucherLines,
      narration,
    });
    if (voucher.totalCredit === 0 && voucher.totalDebit === 0) continue;
    preparedVoucherInputs.push(voucher);
  }

  return { preparedVoucherInputs, isCurrencyConversionRequired };
};

type GetLedgerIdByConfigInput = {
  accountingIntegrationConfigDetail: AccountingIntegrationConfigDetails;
  input: unknown;
  ledgerTypes: Ledger[];
  companyId: number;
  createdBy: number;
};

/** Helper function to get the ledger id by the config */
export const getFlatLedgerIdByConfig = async (
  body: GetLedgerIdByConfigInput,
): Promise<number> => {
  if (body.accountingIntegrationConfigDetail.ledgerType === "ID") {
    const ledgerId = body.accountingIntegrationConfigDetail.ledgerValue;

    if (!ledgerId || isNaN(Number(ledgerId))) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Ledger Id"),
      );
    }

    const ledger = body.ledgerTypes.find(
      (ledger) => ledger.id === Number(ledgerId),
    );
    if (!ledger) {
      throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Ledger"));
    }

    return ledger.id;
  } else {
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);

    /** Find ledger for insurance or corporate or pms distributor */
    if (body.accountingIntegrationConfigDetail.ledgerValue === "clientId") {
      const input = body.input as ExternalPostVoucherInput;

      /** PMS Distributor Case */
      const pmsDistributorCase: VoucherReferenceType[] = [
        VoucherReferenceType.PHARMACY_GRN,
        VoucherReferenceType.PHARMACY_GRN_PAYMENT,
        VoucherReferenceType.PHARMACY_GRN_REFUND,
        VoucherReferenceType.PHARMACY_GRN_RETURN,
      ];

      if (pmsDistributorCase.includes(input.refType)) {
        const distributor = await validateIdPmsDistributor(
          Number(input.clientId),
        );

        const clientLedgerMapping =
          await getClientLedgerMappingByClientIdAndClientType({
            clientId: Number(input.clientId),
            clientType: ClientType.PMS_DISTRIBUTOR,
          });

        if (clientLedgerMapping) {
          return clientLedgerMapping.ledgerId;
        }

        const ledgerName = `${distributor.proInName}`;

        if (!body.accountingIntegrationConfigDetail.groupId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Group Id"),
          );
        }
        const ledgerCreateInput: CreateOrUpdateLedgerInput = {
          companyId: body.companyId,
          groupId: body.accountingIntegrationConfigDetail.groupId,
          name: ledgerName,
        };

        const newLedger = await createLedgerInDb(ledgerCreateInput);
        if (isCacheable && newLedger) {
          await addToCache(ledgerCacheKey, newLedger.id, newLedger);
        }

        // await updatePmsDistributorInDb({ id: Number(input.clientId), ledgerId: newLedger.id });

        await createClientLedgerMapping({
          clientId: Number(input.clientId),
          clientType: ClientType.PMS_DISTRIBUTOR,
          ledgerId: newLedger.id,
          createdBy: input.createdBy,
        });
        return newLedger.id;
      }

      /** Inventory supplier case */
      const inventorySupplierCase: VoucherReferenceType[] = [
        VoucherReferenceType.INVENTORY_GRN,
        VoucherReferenceType.INVENTORY_GRN_RETURN,
        VoucherReferenceType.INVENTORY_GRN_PAYMENT,
        VoucherReferenceType.INVENTORY_GRN_REFUND,
      ];

      if (inventorySupplierCase.includes(input.refType)) {
        const supplier = await validateIdInventorySupplier(
          Number(input.clientId),
        );

        const clientLedgerMapping =
          await getClientLedgerMappingByClientIdAndClientType({
            clientId: Number(input.clientId),
            clientType: ClientType.INV_ITEM_SUPPLIER,
          });

        if (clientLedgerMapping) {
          return clientLedgerMapping.ledgerId;
        }

        const ledgerName = `${supplier.vendorCompanyName}`;
        if (!body.accountingIntegrationConfigDetail.groupId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Group Id"),
          );
        }
        const ledgerCreateInput: CreateOrUpdateLedgerInput = {
          companyId: body.companyId,
          groupId: body.accountingIntegrationConfigDetail.groupId,
          name: ledgerName,
        };
        const newLedger = await createLedgerInDb(ledgerCreateInput);
        if (isCacheable && newLedger) {
          await addToCache(ledgerCacheKey, newLedger.id, newLedger);
        }
        await createClientLedgerMapping({
          clientId: Number(input.clientId),
          clientType: ClientType.INV_ITEM_SUPPLIER,
          ledgerId: newLedger.id,
          createdBy: input.createdBy,
        });
        return newLedger.id;
      }
      /**--------------------------------------------------------------------- */

      if (input.refSubType === ConfigSubRefType.INSURANCE) {
        const insurance = await validateIdInsuranceMaster(
          Number(input.clientId),
        );
        const clientLedgerMapping =
          await getClientLedgerMappingByClientIdAndClientType({
            clientId: Number(input.clientId),
            clientType: ClientType.INSURANCE,
          });

        if (clientLedgerMapping) {
          return clientLedgerMapping.ledgerId;
        }

        const ledgerName = `${insurance.customerCode}(${insurance.customerName})`;
        if (!body.accountingIntegrationConfigDetail.groupId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Group Id"),
          );
        }
        const ledgerCreateInput: CreateOrUpdateLedgerInput = {
          companyId: body.companyId,
          groupId: body.accountingIntegrationConfigDetail.groupId,
          name: ledgerName,
        };
        const newLedger = await createLedgerInDb(ledgerCreateInput);
        if (isCacheable && newLedger) {
          await addToCache(ledgerCacheKey, newLedger.id, newLedger);
        }
        // await updateInsuranceInDb({ id: Number(input.clientId), ledgerId: newLedger.id });
        await createClientLedgerMapping({
          clientId: Number(input.clientId),
          clientType: ClientType.INSURANCE,
          ledgerId: newLedger.id,
          createdBy: input.createdBy,
        });
        return newLedger.id;
      } else if (input.refSubType === ConfigSubRefType.CORPORATE) {
        const corporate = await validateIdClientMaster(Number(input.clientId));
        const clientLedgerMapping =
          await getClientLedgerMappingByClientIdAndClientType({
            clientId: Number(input.clientId),
            clientType: ClientType.CORPORATE,
          });

        if (clientLedgerMapping) {
          return clientLedgerMapping.ledgerId;
        }
        const ledgerName = `${corporate.customeCustomerCode}(${corporate.customerName})`;
        if (!body.accountingIntegrationConfigDetail.groupId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Group Id"),
          );
        }
        const ledgerCreateInput: CreateOrUpdateLedgerInput = {
          companyId: body.companyId,
          groupId: body.accountingIntegrationConfigDetail.groupId,
          name: ledgerName,
        };
        const newLedger = await createLedgerInDb(ledgerCreateInput);
        if (isCacheable && newLedger) {
          await addToCache(ledgerCacheKey, newLedger.id, newLedger);
        }
        // await updateCorporateInDb({ id: Number(input.clientId), ledgerId: newLedger.id });
        await createClientLedgerMapping({
          clientId: Number(input.clientId),
          clientType: ClientType.CORPORATE,
          ledgerId: newLedger.id,
          createdBy: input.createdBy,
        });
        return newLedger.id;
      }
    }
    /**-------------------------------------------------------------------*/

    if (
      body.accountingIntegrationConfigDetail.isPaymentRelated &&
      body.accountingIntegrationConfigDetail.type === "ARRAY"
    ) {
      const allGroups = await commonGetService.getAllElements<"Group">({
        cacheCode: "GROUP",
        canNullReturnable: true,
        modelName: "Group",
        shortCode: "GROUP",
        useActiveFlag: true,
      });
      const groups = allGroups.filter(
        (group) => group.companyId === body.companyId,
      ) as Group[];

      const paymentInput = body.input as paymentInput;
      if (!paymentInput?.paymentMode) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Payment Mode"),
        );
      }
      if (!paymentInput?.bankOrCashId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Bank Or Cash Id"),
        );
      }
      if (!paymentInput?.paymentAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Payment Amount"),
        );
      }

      const clientLedgerMapping =
        await getClientLedgerMappingByClientIdAndClientType({
          clientId: Number(paymentInput.bankOrCashId),
          clientType: ClientType.BANK_OR_CASH,
        });

      if (clientLedgerMapping) {
        return clientLedgerMapping.ledgerId;
      }

      const cashOrBankHead = await getCashAndBankHeadByIdFromDb(
        Number(paymentInput.bankOrCashId),
      );
      if (!cashOrBankHead) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Cash or bank head"),
        );
      }

      const ledgerName = cashOrBankHead.name;

      let groupId = 0;
      if (paymentInput?.paymentMode === "CASH") {
        const group = groups.find(
          (group) => group.name === CASH_BANK_GROUP_NAMES.CASH,
        );
        if (!group) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Group"),
          );
        }
        groupId = group.id;
      } else {
        const group = groups.find(
          (group) => group.name === CASH_BANK_GROUP_NAMES.BANK,
        );
        if (!group) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Group"),
          );
        }
        groupId = group.id;
      }

      const ledgerCreateInput: CreateOrUpdateLedgerInput = {
        companyId: body.companyId,
        groupId: groupId,
        name: ledgerName,
        ledgerType:
          paymentInput.paymentMode === PaymentMode.CASH
            ? LedgerType.CASH
            : LedgerType.BANK,
        isBankAccount: true,
      };
      const newLedger = await createLedgerInDb(ledgerCreateInput);
      if (isCacheable && newLedger) {
        await addToCache(ledgerCacheKey, newLedger.id, newLedger);
      }
      await createClientLedgerMapping({
        clientId: Number(paymentInput.bankOrCashId),
        clientType: ClientType.BANK_OR_CASH,
        ledgerId: newLedger.id,
        createdBy: body.createdBy,
      });
      return newLedger.id;
    } else {
      const ledgerName = getNestedValue<string>(
        body.input,
        body.accountingIntegrationConfigDetail.ledgerValue,
      );
      if (!ledgerName) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Ledger Name"),
        );
      }

      const ledger = body.ledgerTypes.find(
        (ledger) => ledger.name === ledgerName,
      );
      if (ledger) {
        return ledger.id;
      }
      if (!body.accountingIntegrationConfigDetail.groupId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Group Id"),
        );
      }
      const ledgerCreateInput: CreateOrUpdateLedgerInput = {
        companyId: body.companyId,
        groupId: body.accountingIntegrationConfigDetail.groupId,
        name: ledgerName,
      };
      const newLedger = await createLedgerInDb(ledgerCreateInput);
      if (isCacheable && newLedger) {
        await addToCache(ledgerCacheKey, newLedger.id, newLedger);
      }
      return newLedger.id;
    }
  }
};

/**Helper functions */

export type VoucherLineSeed = Omit<CreateOrUpdateVoucherLineInput, "lineNo">;

export const buildVoucher = (
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
    createdBy?: number;
    status?: VoucherStatus;
    voucherLines: VoucherLineSeed[];
  },
): preparedVoucherInput => {
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
