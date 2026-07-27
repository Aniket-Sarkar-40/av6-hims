import { CashFlowView } from "@/types/reports/cashFlow.js";
import { FundFlowView, SummaryLevel } from "@/types/reports/fundFlow.js";
import {
  boolRequired,
  boolWithDefault,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  numberArrayOptional,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

import Joi from "joi";

const trialBalanceRequestInputSchema = Joi.object({
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  fromDate: dateRequired("From Date"),
  toDate: dateRequired("To Date"),
  ccId: idOptional("Cost Center Id"),
  ledgerIds: numberArrayOptional("Ledger Ids"),
  includeZero: boolWithDefault("Include Zero", false),
});

export const ledgerBookRequestInputSchema = Joi.object({
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  ledgerId: idRequired("Ledger Id"),
  fromDate: dateRequired("From Date"),
  toDate: dateRequired("To Date"),
  ccId: idOptional("Cost Center Id"),
});

export const ledgerBookExcelRequestInputSchema =
  ledgerBookRequestInputSchema.keys({
    showNarration: boolRequired("Show Narration"),
    showCreatedBy: boolRequired("Show Created By"),
    showUpdatedBy: boolRequired("Show Updated By"),
  });

export const reportCommonRequestInputSchema = Joi.object({
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  fromDate: dateRequired("From Date"),
  toDate: dateRequired("To Date"),
  ccId: idOptional("Cost Center Id"),
  includeZero: boolWithDefault("Include Zero", false),
});

const groupSummaryRequestInputSchema = reportCommonRequestInputSchema.keys({
  groupId: idRequired("Group Id"),
});

const forexGainLossStatementRequestInputSchema =
  reportCommonRequestInputSchema.keys({
    groupId: idOptional("Group Id"),
  });

const balanceSheetRequestInputSchema = Joi.object({
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  asOnDate: dateRequired("As On Date"),
  ccId: idOptional("Cost Center Id"),
  includeZero: boolWithDefault("Include Zero", false),
});

const statementOfAccountsRequestInputSchema =
  reportCommonRequestInputSchema.keys({
    ageing: Joi.object({
      buckets: Joi.array()
        .items(
          Joi.object({
            from: Joi.number().integer().min(0).required().messages({
              "number.min": "From must be greater than or equal to 0",
            }),
            to: Joi.number().integer().min(0).required().messages({
              "number.min": "To must be greater than or equal to 0",
            }),
          }),
        )
        .min(1)
        .required()
        .messages({
          "array.min": "At least one bucket is required",
        }),
    }).optional(),
  });

const cashAndFundFlowCommonSchema = Joi.object({
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  fromDate: dateRequired("From Date"),
  toDate: dateRequired("To Date"),
  ccId: idOptional("Cost Center Id"),
  groupId: idOptional("Group Id"),
  month: strOptional("Month"),
  view: enumRequired("View", CashFlowView),
  includeZero: boolWithDefault("Include Zero", false),
});
const cashFlowRequestInputSchema = cashAndFundFlowCommonSchema.keys({
  view: enumRequired("View", CashFlowView),
});
const fundFlowRequestInputSchema = cashAndFundFlowCommonSchema.keys({
  view: enumRequired("View", FundFlowView),
  summaryLevel: Joi.when("view", {
    is: FundFlowView.SUMMARY,
    then: enumOptional("Summary Level", SummaryLevel),
    otherwise: Joi.forbidden(),
  }).messages({
    "any.unknown": "Summary Level is allowed only when view is SUMMARY",
    "any.forbidden": "Summary Level is allowed only when view is SUMMARY",
  }),
});

export const validateTrialBalanceRequestInput = validationHandler({
  schema: trialBalanceRequestInputSchema,
  path: "body",
});

export const validateLedgerBookRequestInput = validationHandler({
  schema: ledgerBookRequestInputSchema,
  path: "body",
});

export const validateLedgerBookExcelRequestInput = validationHandler({
  schema: ledgerBookExcelRequestInputSchema,
  path: "body",
});

export const validateReportCommonRequestInput = validationHandler({
  schema: reportCommonRequestInputSchema,
  path: "body",
});

export const validateBalanceSheetRequestInput = validationHandler({
  schema: balanceSheetRequestInputSchema,
  path: "body",
});

export const validateGroupSummaryRequestInput = validationHandler({
  schema: groupSummaryRequestInputSchema,
  path: "body",
});

export const validateForexGainLossStatementRequestInput = validationHandler({
  schema: forexGainLossStatementRequestInputSchema,
  path: "body",
});

export const validateCashBankSummaryRequestInput = validationHandler({
  schema: reportCommonRequestInputSchema,
  path: "body",
});

export const validateStatementOfAccountsRequestInput = validationHandler({
  schema: statementOfAccountsRequestInputSchema,
  path: "body",
});

export const validateCashFlowRequestInput = validationHandler({
  schema: cashFlowRequestInputSchema,
  path: "body",
});

export const validateFundFlowRequestInput = validationHandler({
  schema: fundFlowRequestInputSchema,
  path: "body",
});
