import type {
  EventRecipientRule,
  Prisma,
  TemplateType,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type CreateOrUpdateEventRecipients = Omit<
  Prisma.EventRecipientRuleUncheckedCreateInput,
  "isActive" | "eventConfig" | "createdAt" | "updatedAt"
>;

export interface MultiCreateUpdateEventRecipients {
  eventConfigId: number;
  templateType: TemplateType;
  rules: Omit<
    CreateOrUpdateEventRecipients,
    "eventConfigId" | "templateType"
  >[];

  existingRules: EventRecipientRule[];
}

export type EventRecipientRuleInput = Prisma.EventRecipientRuleGetPayload<{
  include: {
    eventConfig: true;
  };
}>;

export interface EventRecipientRuleDTO
  extends Omit<EventRecipientRule, BaseModelAttr | "eventConfigId"> {
  eventConfig: IdValue | null;
}
