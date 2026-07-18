import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import type {
  CreateOrUpdateEventRecipients,
  MultiCreateUpdateEventRecipients,
} from "@/types/event/eventRecipientRule.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  EventRecipientRule,
  TemplateType,
} from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";

export const createEventRecipientRuleInDb = async (
  input: CreateOrUpdateEventRecipients,
) => {
  logger.info("entering::createEventRecipientRuleInDb::repository");

  const omittedData = customOmit(input, ["id"]);

  const created = await db.eventRecipientRule.create({
    data: {
      ...omittedData.rest,
    },
  });

  logger.info("exiting::createEventRecipientRuleInDb::repository");
  return created;
};

export const multiCreateUpdateEventRecipientRule = async (
  input: MultiCreateUpdateEventRecipients,
) => {
  logger.info("entering::multiCreateUpdateEventRecipientRule::repository");

  const toCreateRecipientRule = input.rules.filter((r) => !r.id);
  const toUpdateRecipientRule = input.rules.filter((r) => r.id);
  const toDeleteRecipientRule = input.existingRules
    .filter((ex) => !input.rules.some((r) => r.id === ex.id))
    .map((x) => x.id);

  const currentUser = requestStorage.getStore()?.user?.id ?? null;
  // typeof d.id !== "number"
  await db.$transaction(async (tx) => {
    await tx.eventRecipientRule.createMany({
      data: toCreateRecipientRule.map((r) => {
        const omitted = customOmit(r, ["id"]);

        return omitUndefined({
          ...omitted.rest,
          eventConfigId: input.eventConfigId,
          templateType: input.templateType,
          createdBy: currentUser,
        });
      }),
    });

    await Promise.all(
      toUpdateRecipientRule.map((r) => {
        tx.eventRecipientRule.update({
          where: {
            id: r.id!,
          },
          data: omitUndefined({
            ...r,
            eventConfigId: input.eventConfigId,
            templateType: input.templateType,
            updatedBy: currentUser,
          }),
        });
      }),
    );

    await tx.eventRecipientRule.updateMany({
      where: {
        id: {
          in: toDeleteRecipientRule,
        },
      },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser ?? null,
        isActive: false,
      },
    });
  });
};

export const getEventRecipientRulesByEventConfigIdFromDb = async (
  eventConfigId: number,
): Promise<EventRecipientRule[]> => {
  logger.info(
    "entering::getEventRecipientRulesByEventConfigIdFromDb::repository",
  );
  const rules = await db.eventRecipientRule.findMany({
    where: { eventConfigId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  logger.info(
    "exiting::getEventRecipientRulesByEventConfigIdFromDb::repository",
  );
  return rules;
};
export const getEventRecipientRulesByEventConfigs = async (): Promise<
  EventRecipientRule[]
> => {
  logger.info("entering::getEventRecipientRulesByEventConfigs::repository");
  const rules = await db.eventRecipientRule.findMany({
    where: {
      isActive: true,
    },
  });
  logger.info("exiting::getEventRecipientRulesByEventConfigs::repository");
  return rules;
};

export const getEventRecipientRuleByIdFromDb = async (
  id: number,
): Promise<EventRecipientRule | null> => {
  logger.info("entering::getEventRecipientRuleByIdFromDb::repository");
  const rule = await db.eventRecipientRule.findFirst({
    where: { id, isActive: true },
  });
  logger.info("exiting::getEventRecipientRuleByIdFromDb::repository");
  return rule;
};

export const getEventRecipientRulesByEventConfigIdOnlyFromDb = async (
  eventConfigId: number,
  templateType?: TemplateType,
): Promise<EventRecipientRule[]> => {
  logger.info(
    "entering::getEventRecipientRulesByEventConfigIdOnlyFromDb::repository",
  );
  const rules = await db.eventRecipientRule.findMany({
    where: {
      eventConfigId,
      isActive: true,
      ...(templateType ? { templateType } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
  logger.info(
    "exiting::getEventRecipientRulesByEventConfigIdOnlyFromDb::repository",
  );
  return rules;
};

export const updateEventRecipientRuleInDb = async (
  rule: CreateOrUpdateEventRecipients,
) => {
  logger.info("entering::updateEventRecipientRuleInDb::repository");
  const omittedData = customOmit(rule, ["id"]);
  return await db.eventRecipientRule.update({
    where: { id: rule.id!, isActive: true },
    data: {
      ...omittedData.rest,
    },
  });
};
