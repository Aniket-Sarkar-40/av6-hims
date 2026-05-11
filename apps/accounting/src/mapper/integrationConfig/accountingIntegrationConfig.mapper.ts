import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import {
  AccountingIntegrationConfigDetailsDTO,
  AccountingIntegrationConfigDTO,
  AccountingIntegrationConfigResponse,
} from "@/types/integrationConfig/accountingIntegrationConfig.js";
import { AccountingIntegrationConfigDetails } from "@repo/db/generated/prisma/client";
import { ConfigLedgerType } from "@repo/db/generated/prisma/enums.js";
import { customOmit, toIdValue } from "av6-utils";

export const toAccountingIntegrationConfigDTO = async (
  accountingIntegrationConfig: AccountingIntegrationConfigResponse[]
): Promise<AccountingIntegrationConfigDTO[]> => {
  const groups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

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

  const response: AccountingIntegrationConfigDTO[] =
    accountingIntegrationConfig.map((config) => {
      const voucherType = voucherTypes.find(
        (type) => type.id === config.voucherTypeId
      );

      const omittedData = customOmit<
        AccountingIntegrationConfigResponse,
        | BaseModelAttrWoCancel
        | "voucherTypeId"
        | "accountingIntegrationConfigDetails"
      >(config, [
        "isActive",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "voucherTypeId",
        "accountingIntegrationConfigDetails",
      ]);

      const accountingIntegrationConfigDetails: AccountingIntegrationConfigDetailsDTO[] =
        config.accountingIntegrationConfigDetails.map((detail) => {
          const group = groups.find((group) => group.id === detail.groupId);
          const ledger =
            detail.ledgerType === ConfigLedgerType.ID
              ? ledgers.find(
                  (ledger) => ledger.id === Number(detail.ledgerValue)
                )
              : null;

          const omittedData = customOmit<
            AccountingIntegrationConfigDetails,
            BaseModelAttrWoCancel | "groupId" | "ledgerValue"
          >(detail, [
            "isActive",
            "createdBy",
            "createdAt",
            "updatedBy",
            "updatedAt",
            "deletedBy",
            "deletedAt",
          ]);

          return {
            ...omittedData.rest,
            group: group ? toIdValue(group, "name") : null,
            ledgerValue: ledger
              ? toIdValue(ledger, "name")
              : detail.ledgerValue,
          };
        });

      return {
        ...omittedData.rest,
        voucherType: toIdValue(voucherType, "name"),
        accountingIntegrationConfigDetails: accountingIntegrationConfigDetails,
      };
    });

  return response;
};
