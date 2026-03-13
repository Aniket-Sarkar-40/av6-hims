import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { uinConfigService } from "av6-core";
import { CreateOrUpdateTemplate } from "@/types/event/template.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Prisma,
  Template,
  UinShortCode,
} from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";
import { uinServiceFactory } from "@/config/core.config.js";

export const createTemplateInDb = async (
  template: CreateOrUpdateTemplate
): Promise<Template> => {
  logger.info("entering::createTemplateInDb::repository");
  const store = requestStorage.getStore();
  const templateData = customOmit(template, ["id"]);
  return db.$transaction(async (tx) => {
    const createdTemplate = await tx.template.create({
      data: omitUndefined({
        ...templateData.rest,
        templateCode:
          template.templateCode ??
          (await uinServiceFactory.generateUIN(UinShortCode.TEMP_CODE)),
        createdBy: store?.user?.id,
      }),
    });

    return createdTemplate;
  });
};

export const getAllTemplateFromDb = async (): Promise<Template[]> => {
  logger.info("entering::getAllTemplate::repository");
  return db.template.findMany({
    where: {
      isActive: true,
    },
  });
};

export const getTemplateByIdFromDb = async (
  id: number
): Promise<Template | null> => {
  logger.info("entering::getTemplateById::repository");
  return db.template.findFirst({
    where: { id, isActive: true },
  });
};

export const updateTemplateInDb = async (
  template: CreateOrUpdateTemplate
): Promise<Template> => {
  const store = requestStorage.getStore();
  const userId = store?.user?.id;

  const templateData = customOmit(template, ["id", "eventConfigId"]);
  return db.template.update({
    where: { id: template.id! },
    data: omitUndefined({
      ...templateData.rest,
      updatedBy: userId ?? null,
    }),
  });
};
