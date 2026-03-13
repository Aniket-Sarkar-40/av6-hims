import { uinServiceFactory } from "@/config/core.config.js";
import { CreateOrUpdateTemplate } from "@/types/master/template.js";
import { db } from "@repo/db/client";
import {
  Template,
  TemplateType,
  UinShortCode,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";
import { customOmit } from "av6-utils";

export const createTemplateInDb = async (
  template: CreateOrUpdateTemplate
): Promise<Template> => {
  logger.info("entering::createTemplateInDb::repository");
  const store = requestStorage.getStore();
  const templateData = customOmit<CreateOrUpdateTemplate, "id">(template, [
    "id",
  ]);
  return db.template.create({
    data: omitUndefined({
      ...templateData.rest,
      templateCode:
        template.templateCode ??
        (await uinServiceFactory.generateUIN(UinShortCode.TEMP_CODE)),
      createdBy: store?.user?.id,
    }),
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

export const getTemplateByTemplateNameAndTypeFromDb = async (
  templateName: string,
  templateType: TemplateType
): Promise<Template | null> => {
  logger.info("entering::getTemplateByTemplateNameAndType::repository");
  return db.template.findFirst({
    where: { templateName, templateType, isActive: true },
  });
};

export const getTemplateByTemplateCodeFromDb = async (
  templateCode: string
): Promise<Template | null> => {
  logger.info("entering::getTemplateByTemplateCode::repository");
  return db.template.findFirst({
    where: { templateCode, isActive: true },
  });
};

export const updateTemplateInDb = async (
  template: CreateOrUpdateTemplate
): Promise<Template> => {
  const store = requestStorage.getStore();
  const userId = store?.user?.id;
  return db.template.update({
    where: { id: template.id! },
    data: omitUndefined({
      ...template,
      templateCode:
        template.templateCode ??
        (await uinServiceFactory.generateUIN(UinShortCode.TEMP_CODE)),
      updatedBy: userId,
    }),
  });
};
