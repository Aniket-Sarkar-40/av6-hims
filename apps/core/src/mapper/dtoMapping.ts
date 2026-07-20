import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import {
  City,
  CoreUINConfig,
  Country,
  EventConfig,
  Expense,
  Income,
  PdfTemplate,
  ServiceEvent,
  State,
} from "@repo/db/generated/prisma/client";
import { toExpenseDTO } from "@/mapper/consumerConnect/expense.mapper.js";
import { toIncomeDTO } from "@/mapper/consumerConnect/income.mapper.js";
import { toCityDTOOnlyForCity } from "@/mapper/master/city.mapper.js";
import { toUINConfigDTO } from "av6-core-v2";
import { toStateDTOForState } from "@/mapper/master/state.mapper.js";
import { toCountryDto } from "@/mapper/master/country.mapper.js";
import { toEventConfigDTO } from "@/mapper/event/eventConfig.mapper.js";
import { toPdfTemplateDTO } from "@/mapper/pdf/pdf.mapper.js";
import { EventRecipientRuleInput } from "@/types/event/eventRecipientRule.js";
import { toEventRecipientRuleDTO } from "@/mapper/event/eventRecipientRule.mapper.js";
// import { toCityDTOOnlyForCity } from "@repo/core/mapper/master/city.mapper.js";
// import { toCountryDto } from "@repo/core/mapper/master/country.mapper.js";
// import { toStateDTOForState } from "@repo/core/mapper/master/state.mapper.js";
// import { toUINConfigDTO } from "@repo/core/mapper/master/uinConfig.mapper.js";
// import { toServiceEventDTO } from "@repo/core/mapper/master/serviceEvent.mapper.js";
// import { toEventConfigDTO } from "@repo/core/mapper/master/eventConfig.mapper.js";
// import { toPdfTemplateDTO } from "@repo/core/mapper/pdf/pdf.mapper.js";

// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.EXPENSE]: (data: unknown) => toExpenseDTO(data as Expense),
  [SHORT_CODE.INCOME]: (data: unknown) => toIncomeDTO(data as Income),
  [SHORT_CODE.CITY]: (data: unknown) => toCityDTOOnlyForCity(data as City),
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as CoreUINConfig),
  [SHORT_CODE.STATE]: (data: unknown) => toStateDTOForState(data as State),
  [SHORT_CODE.COUNTRY]: (data: unknown) => toCountryDto(data as Country),
  // [SHORT_CODE.SERVICE_EVENT]: (data: unknown) =>
  //   toServiceEventDTO(data as ServiceEvent),
  [SHORT_CODE.EVENT_CONFIG]: (data: unknown) =>
    toEventConfigDTO(data as EventConfig[]),
  [SHORT_CODE.PDF_TEMPLATE]: (data: unknown) =>
    toPdfTemplateDTO(data as PdfTemplate),
  [SHORT_CODE.EVENT_RECIPIENT_RULE]: (data: unknown) =>
    toEventRecipientRuleDTO(data as EventRecipientRuleInput[]),
};
