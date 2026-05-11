import { CompanyResponse } from "@/types/company/company.js";
import { CostCenterResponse } from "@/types/master/costCenter.js";
import { GroupResponse } from "@/types/master/group.js";
import { LedgerResponse } from "@/types/master/ledger.js";
import { VoucherTypeResponse } from "@/types/master/voucherType.js";
import { VoucherResponseForDTO } from "@/types/voucher/voucher.js";

import { toCompanyDto } from "@/mapper/company/company.mapper.js";
import { toCompanyFinancialYearDto } from "@/mapper/master/companyFinancialYear.mapper.js";
import { toCostCenterDto } from "@/mapper/master/costCenter.mapper.js";
import { toGroupDto } from "@/mapper/master/group.mapper.js";
import { toLedgerDto } from "@/mapper/master/ledger.mapper.js";
import { toVoucherTypeDto } from "@/mapper/master/voucherType.mapper.js";
import { toVoucherDTO } from "@/mapper/voucher/voucher.mapper.js";
import { BankStatementRowResponse } from "@/types/bankReconciliation/bankReconciliation.js";
import { AccountingIntegrationConfigResponse } from "@/types/integrationConfig/accountingIntegrationConfig.js";
import { CompanyFinancialYearResponse } from "@/types/master/companyFinancialYear.js";
import { toUINConfigDTO } from "av6-core-v2";
import {
  toBankStatementDTO,
  toBankStatementRowDTO,
} from "./bankReconciliation/bankReconciliation.mapper.js";
import { toAccountingIntegrationConfigDTO } from "./integrationConfig/accountingIntegrationConfig.mapper.js";
import { toNarrationDto } from "./master/narration.mapper.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import { toPickFieldsArray } from "av6-utils";
import {
  AccDynamicShortCode,
  AccUINConfig,
  BankStatement,
  Narration,
} from "@repo/db/generated/prisma/client";
// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as AccUINConfig),
  [SHORT_CODE.DYNAMIC_SHORT_CODE]: (data: unknown) =>
    toPickFieldsArray(data as AccDynamicShortCode[], "shortCode", "tableName"),
  [SHORT_CODE.COMPANY]: (data: unknown) =>
    toCompanyDto(data as CompanyResponse),
  [SHORT_CODE.GROUP]: (data: unknown) => toGroupDto(data as GroupResponse[]),
  [SHORT_CODE.LEDGER]: (data: unknown) => toLedgerDto(data as LedgerResponse[]),
  [SHORT_CODE.VOUCHER_TYPE]: (data: unknown) =>
    toVoucherTypeDto(data as VoucherTypeResponse[]),
  [SHORT_CODE.COST_CENTER]: (data: unknown) =>
    toCostCenterDto(data as CostCenterResponse[]),
  [SHORT_CODE.VOUCHER]: (data: unknown) =>
    toVoucherDTO(data as VoucherResponseForDTO[]),
  [SHORT_CODE.COMPANY_FINANCIAL_YEAR]: (data: unknown) =>
    toCompanyFinancialYearDto(data as CompanyFinancialYearResponse[]),
  [SHORT_CODE.NARRATION]: (data: unknown) =>
    toNarrationDto(data as Narration[]),
  [SHORT_CODE.INTEGRATION_CONFIG]: (data: unknown) =>
    toAccountingIntegrationConfigDTO(
      data as AccountingIntegrationConfigResponse[]
    ),
  [SHORT_CODE.BANK_STATEMENT_ROW]: (data: unknown) =>
    toBankStatementRowDTO(data as BankStatementRowResponse[]),
  [SHORT_CODE.BANK_STATEMENT]: (data: unknown) =>
    toBankStatementDTO(data as BankStatement[]),
};
