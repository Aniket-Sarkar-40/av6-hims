import {
  EventRecipientRuleDTO,
  EventRecipientRuleInput,
} from "@/types/event/eventRecipientRule.js";
import { customOmit, toIdValue } from "av6-utils";

export const toEventRecipientRuleDTO = async (
  data: EventRecipientRuleInput[],
): Promise<EventRecipientRuleDTO[]> => {
  return data.map((rule) => {
    const omittedRule = customOmit<
      EventRecipientRuleInput,
      "createdAt" | "updatedAt" | "isActive" | "eventConfigId"
    >(rule, ["createdAt", "updatedAt", "isActive", "eventConfigId"]);

    return {
      ...omittedRule.rest,
      eventConfig: toIdValue(rule.eventConfig, "eventName"),
    };
  });
};
